/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/sensor.ts
 */

import type { HomeAssistant } from '../types';

export interface SensorNumericDeviceClasses {
  numeric_device_classes: string[];
}

let sensorNumericDeviceClassesCache:
  | Promise<SensorNumericDeviceClasses>
  | undefined;

export const getSensorNumericDeviceClasses = async (
  hass: HomeAssistant,
): Promise<SensorNumericDeviceClasses> => {
  if (sensorNumericDeviceClassesCache) {
    return sensorNumericDeviceClassesCache;
  }
  sensorNumericDeviceClassesCache = hass.callWS({
    type: 'sensor/numeric_device_classes',
  });
  return sensorNumericDeviceClassesCache;
};
