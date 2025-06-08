import type { DeviceRegistryEntry } from '@hass/data/device_registry';
import memoizeOne from 'memoize-one';

/**
 * Retrieves device information
 *
 * @param {Record<string, DeviceRegistryEntry>} devices - The devices registry
 * @param {string} deviceId - The ID of the device
 * @returns {DeviceRegistryEntry} The device information
 */
export const getDevice = memoizeOne(
  (
    devices: Record<string, DeviceRegistryEntry>,
    deviceId: string,
  ): DeviceRegistryEntry | undefined => devices[deviceId],
);
