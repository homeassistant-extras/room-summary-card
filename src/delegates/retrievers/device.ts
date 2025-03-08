import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import type { HomeAssistant } from '@hass/types';

/**
 * Retrieves device information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} deviceId - The ID of the device
 * @returns {Device} The device information
 */

export const getDevice = (
  hass: HomeAssistant,
  deviceId: string,
): DeviceRegistryEntry => (hass.devices as { [key: string]: any })[deviceId];
