import { hasFeature } from '@config/feature';
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

    const tempThreshold = config.thresholds?.temperature ?? 80;
    const humidThreshold = config.thresholds?.humidity ?? 60;

    return {
      hot: temp ? temp > tempThreshold : false,
      humid: humidity ? humidity > humidThreshold : false,
    };
  },
);
