/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_device_name.ts
 */

import type { DeviceRegistryEntry } from '../../data/device_registry';

export const computeDeviceName = (
  device: DeviceRegistryEntry,
): string | undefined => (device.name_by_user ?? device.name)?.trim();
