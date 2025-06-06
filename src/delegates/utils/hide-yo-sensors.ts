import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/retrievers/device';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityState } from '@type/config';

/**
 * Retrieves a list of sensor entity states for a given area based on the provided configuration.
 *
 * This function filters Home Assistant entities to find those that are either explicitly listed
 * in the config's sensors array or have a device class of 'temperature' or 'humidity'. It ensures
 * that the entity or its associated device is not already assigned to the specified area.
 *
 * @param hass - The Home Assistant instance containing entities and their states.
 * @param config - The configuration object, which may specify a list of sensor entity IDs.
 * @returns An array of EntityState objects representing the matching sensors.
 */
export const getSensors = (
  hass: HomeAssistant,
  config: Config,
): EntityState[] => {
  // Check if we should skip default entities
  const skip = hasFeature(config, 'exclude_default_entities');

  // Create arrays to hold different categories
  const configOrderedSensors: EntityState[] = [];
  const temperatureSensors: EntityState[] = [];
  const humiditySensors: EntityState[] = [];

  // Process and categorize sensors in one step
  Object.values(hass.entities).forEach((entity) => {
    const device = getDevice(hass, entity.device_id);
    if (![entity.area_id, device?.area_id].includes(config.area)) return;

    const state = getState(hass, entity.entity_id);
    if (!state) return;

    // Check if this sensor is explicitly configured
    const isConfigSensor = config.sensors?.includes(entity.entity_id);

    // If it's a config sensor, always include it
    if (isConfigSensor) {
      configOrderedSensors.push(state);
      return;
    }

    // If we're skipping default entities, don't process further
    if (skip) return;

    // Check if this is a default climate sensor
    const isClimateDevice = ['temperature', 'humidity'].includes(
      state.attributes?.device_class,
    );

    if (!isClimateDevice) return;

    // Categorize the default climate sensor
    if (state.attributes?.device_class === 'temperature') {
      temperatureSensors.push(state);
    } else if (state.attributes?.device_class === 'humidity') {
      humiditySensors.push(state);
    }
  });

  // Sort config sensors by their order in the config array
  configOrderedSensors.sort((a, b) => {
    const indexA = config.sensors?.indexOf(a.entity_id) ?? -1;
    const indexB = config.sensors?.indexOf(b.entity_id) ?? -1;
    return indexA - indexB;
  });

  // Combine in the desired order:
  // 1. Default temp/humidity (only if not skipping and not in config.sensors)
  // 2. Config-ordered sensors
  return [...temperatureSensors, ...humiditySensors, ...configOrderedSensors];
};
