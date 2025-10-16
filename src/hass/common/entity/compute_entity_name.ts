/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_entity_name.ts
 */

import type {
  EntityRegistryDisplayEntry,
  EntityRegistryEntry,
} from '@hass/data/entity_registry';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config } from '@type/config';
import { d } from '@util/debug';
import { computeDeviceName } from './compute_device_name';
import { computeStateName } from './compute_state_name';
import { stripPrefixFromEntityName } from './strip_prefix_from_entity_name';

export const computeEntityName = (
  stateObj: HassEntity,
  hass: HomeAssistant,
  config: Config,
): string | undefined => {
  d(config, 'computeEntityName - state', stateObj);
  const entry = hass.entities[stateObj.entity_id] as
    | EntityRegistryDisplayEntry
    | undefined;

  if (!entry) {
    d(config, 'computeEntityName - entry not found', entry);
    // Fall back to state name if not in the entity registry (friendly name)
    return computeStateName(stateObj);
  }
  return computeEntityEntryName(entry, hass, config);
};

export const computeEntityEntryName = (
  entry: EntityRegistryDisplayEntry | EntityRegistryEntry,
  hass: HomeAssistant,
  config: Config,
): string | undefined => {
  const name =
    entry.name || ('original_name' in entry ? entry.original_name : undefined);

  const device = entry.device_id ? hass.devices[entry.device_id] : undefined;

  if (!device) {
    if (name) {
      return name;
    }
    const stateObj = hass.states[entry.entity_id] as HassEntity | undefined;
    if (stateObj) {
      return computeStateName(stateObj);
    }
    return undefined;
  }

  const deviceName = computeDeviceName(device);

  // If the device name is the same as the entity name, consider empty entity name
  if (deviceName === name) {
    return undefined;
  }

  // Remove the device name from the entity name if it starts with it
  if (deviceName && name) {
    return stripPrefixFromEntityName(name, deviceName) ?? name;
  }

  d(config, 'computeEntityEntryName - name', name);
  d(config, 'computeEntityEntryName - deviceName', deviceName);

  // slight fix - not the same in HAS
  return name ?? deviceName;
};
