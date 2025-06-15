import { hasFeature } from '@config/feature';
import type { Config } from '@type/config';
import type { AveragedSensor } from '@type/sensor';
import memoizeOne from 'memoize-one';

/**
 * Gets sensor value - from specific entity or averaged sensor
 */
const getSensorValue = (
  sensors: AveragedSensor[],
  deviceClass: string,
  entityId?: string,
): number | null => {
  const sensor = sensors.find((s) => s.device_class === deviceClass);
  if (!sensor) return null;

  if (entityId) {
    const entity = sensor.states.find((state) => state.entity_id === entityId);
    return entity ? Number(entity.state) : null;
  }

  return sensor.average;
};

/**
 * Generates border styles based on temperature and humidity thresholds
 *
 * @param {Config} config - Configuration object
 * @param {AveragedSensor[]} sensors - Array of sensor states
 * @returns {Object} Border style configuration with hot and humid properties
 */
export const climateThresholds = memoizeOne(
  (
    config: Config,
    sensors: AveragedSensor[],
  ): {
    hot: boolean;
    humid: boolean;
  } => {
    if (hasFeature(config, 'skip_climate_styles'))
      return { hot: false, humid: false };

    const temp = getSensorValue(
      sensors,
      'temperature',
      config.thresholds?.temperature_entity,
    );
    const humidity = getSensorValue(
      sensors,
      'humidity',
      config.thresholds?.humidity_entity,
    );

    if (temp === null || humidity === null) return { hot: false, humid: false };

    const tempThreshold = config.thresholds?.temperature ?? 80;
    const humidThreshold = config.thresholds?.humidity ?? 60;

    return {
      hot: temp > tempThreshold,
      humid: humidity > humidThreshold,
    };
  },
);
