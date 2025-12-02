import { hasFeature } from '@config/feature';
import type { ComparisonOperator } from '@type/comparison';
import type { Config, ThresholdEntry } from '@type/config';
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
  defaultValue: number,
  config?: string | number,
): number => {
  if (!config) return defaultValue;
  if (typeof config === 'number') return config;

  const sensor = sensors.find((s) => s.entity_id === config);
  if (sensor) return Number(sensor.state);
  return defaultValue;
};

/**
 * Checks if any threshold entry in an array matches the sensor data
 *
 * @param thresholdEntries - Array of threshold configurations
 * @param sensorData - Sensor data containing individual and averaged sensors
 * @param deviceClass - Device class to filter sensors ('temperature' or 'humidity')
 * @returns true if any threshold condition is met
 */
const checkThresholdEntries = (
  // coalesce to [{}] so that we always have at least one entry to iterate for default values
  thresholdEntries: ThresholdEntry[] = [{}],
  sensorData: SensorData,
  deviceClass: 'temperature' | 'humidity',
): boolean => {
  for (const entry of thresholdEntries) {
    const sensorValue = getSensorValue(
      sensorData,
      deviceClass,
      entry.entity_id,
    );

    if (sensorValue === null) {
      continue;
    }

    // Get threshold value - can be a number or entity ID string
    const thresholdValue = getThresholdSensorValue(
      sensorData.thresholdSensors,
      deviceClass === 'temperature' ? 80 : 60, // Default thresholds
      entry.value,
    );

    const operator = entry.operator ?? 'gt';
    if (meetsThreshold(sensorValue, thresholdValue, operator)) {
      return true;
    }
  }

  return false;
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

    const thresholds = config.thresholds;

    const hot = checkThresholdEntries(
      thresholds?.temperature,
      sensorData,
      'temperature',
    );

    const humid = checkThresholdEntries(
      thresholds?.humidity,
      sensorData,
      'humidity',
    );

    return {
      hot,
      humid,
    };
  },
);
