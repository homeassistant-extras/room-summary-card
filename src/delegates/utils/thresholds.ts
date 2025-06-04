import { hasFeature } from '@config/feature';
import type { Config, EntityState } from '@type/config';

/**
 * Generates border styles based on temperature and humidity thresholds
 *
 * @param {Config} config - Configuration object
 * @param {EntityState[]} sensors - Array of sensor states
 * @returns {Object} Border style configuration with border1 and border2 properties
 */
export const hitThresholds = (
  config: Config,
  sensors: EntityState[],
): {
  overTemp: boolean;
  overHumid: boolean;
} => {
  if (hasFeature(config, 'skip_climate_styles'))
    return { overTemp: false, overHumid: false };

  const tempState = sensors.find(
    (sensor) => sensor.attributes.device_class === 'temperature',
  );
  const humidState = sensors.find(
    (sensor) => sensor.attributes.device_class === 'humidity',
  );
  if (!tempState || !humidState) return { overTemp: false, overHumid: false };

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes.temperature_threshold ?? 80;
  const humidThreshold = tempState.attributes.humidity_threshold ?? 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

  return {
    overTemp: temp > tempThreshold,
    overHumid: humidity > humidThreshold,
  };
};
