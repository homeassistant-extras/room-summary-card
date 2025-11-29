import { hasFeature } from '@config/feature';
import type { ComparisonOperator } from '@type/comparison';
import type { Config } from '@type/config';
import type { SensorData } from '@type/sensor';
import memoizeOne from 'memoize-one';

/**
 * Gets sensor value - from specific entity in individual sensors, or averaged sensor
 */
const getSensorValue = (
  sensorData: SensorData,
  deviceClass: string,
  entityId?: string,
): number | null => {
  // If entityId is specified, look for it in individual sensors first
  if (entityId) {
    const individualSensor = sensorData.individual.find(
      (s) => s.entity_id === entityId,
    );
    if (
      individualSensor &&
      individualSensor.attributes.device_class === deviceClass
    ) {
      return Number(individualSensor.state);
    }
  }

  // Look in averaged sensors
  const averagedSensor = sensorData.averaged.find(
    (s) => s.device_class === deviceClass,
  );
  if (!averagedSensor) return null;

  // If entityId is specified, look for it in the averaged sensor's states
  if (entityId) {
    const entity = averagedSensor.states.find(
      (state) => state.entity_id === entityId,
    );
    return entity ? Number(entity.state) : null;
  }

  return averagedSensor.average;
};

/**
 * Gets threshold value - from specific entity in thresholdSensors sensors, or number configuration
 */
const getThresholdSensorValue = (
  sensors: SensorData['thresholdSensors'],
  config?: string | number,
): number | null => {
  if (!config) return null;
  if (typeof config === 'number') return config;

  if (config) {
    const sensor = sensors.find((s) => s.entity_id === config);
    if (sensor) return Number(sensor.state);
  }
  return null;
};

/**
 * Checks if a numeric value meets a threshold condition using the specified operator
 *
 * @param value - The numeric value to test
 * @param threshold - The threshold value to compare against
 * @param operator - The comparison operator to use
 * @returns true if the condition is met
 */
const meetsThreshold = (
  value: number,
  threshold: number,
  operator: ComparisonOperator,
): boolean => {
  switch (operator) {
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'eq':
      return value === threshold;
    default:
      return value > threshold; // Default to 'gt' for backward compatibility
  }
};

/**
 * Generates border styles based on temperature and humidity thresholds
 *
 * @param {Config} config - Configuration object
 * @param {SensorData} sensorData - Sensor data containing individual and averaged sensors
 * @returns {Object} Border style configuration with hot and humid properties
 */
export const climateThresholds = memoizeOne(
  (
    config: Config,
    sensorData: SensorData,
  ): {
    hot: boolean;
    humid: boolean;
  } => {
    if (hasFeature(config, 'skip_climate_styles'))
      return { hot: false, humid: false };

    const temp = getSensorValue(
      sensorData,
      'temperature',
      config.thresholds?.temperature_entity,
    );
    const humidity = getSensorValue(
      sensorData,
      'humidity',
      config.thresholds?.humidity_entity,
    );

    let tempThreshold =
      getThresholdSensorValue(
        sensorData.thresholdSensors,
        config.thresholds?.temperature,
      ) ?? 80;
    let humidThreshold =
      getThresholdSensorValue(
        sensorData.thresholdSensors,
        config.thresholds?.humidity,
      ) ?? 60;

    const tempOperator = config.thresholds?.temperature_operator ?? 'gt';
    const humidOperator = config.thresholds?.humidity_operator ?? 'gt';

    return {
      hot: temp ? meetsThreshold(temp, tempThreshold, tempOperator) : false,
      humid: humidity
        ? meetsThreshold(humidity, humidThreshold, humidOperator)
        : false,
    };
  },
);
