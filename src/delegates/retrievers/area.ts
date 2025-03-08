import type { AreaRegistryEntry } from '@hass/data/area_registry';
import type { HomeAssistant } from '@hass/types';

/**
 * Retrieves area information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} deviceId - The ID of the device
 * @returns {Area | undefined} The area information
 */

export const getArea = (
  hass: HomeAssistant,
  deviceId: string,
): AreaRegistryEntry | undefined =>
  (hass.areas as { [key: string]: any })[deviceId];
