import { hasFeature } from '@config/feature';
import type { Config } from '@type/config';
import type { AveragedSensor } from '@type/sensor';
import memoizeOne from 'memoize-one';

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

    const tempSensor = sensors.find(
      (sensor) => sensor.device_class === 'temperature',
    );
    const humidSensor = sensors.find(
      (sensor) => sensor.device_class === 'humidity',
    );
    if (!tempSensor || !humidSensor) return { hot: false, humid: false };

    const tempThreshold = config.thresholds?.temperature ?? 80;
    const humidThreshold = config.thresholds?.humidity ?? 60;

    return {
      hot: tempSensor.average > tempThreshold,
      humid: humidSensor.average > humidThreshold,
    };
  },
);
