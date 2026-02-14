import { hasFeature } from '@config/feature';
import type { AreaRegistryEntry } from '@hass/data/area/area_registry';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';

/**
 * Determines whether an entity should be collected as a class-based sensor
 * for averaging. Handles area-default sensor logic: when an area has a
 * configured default temperature/humidity sensor, only that specific sensor
 * is included and other sensors of the same class are skipped.
 */
export const probablyClassSensorUsersMadeThisComplex = (
  state: EntityState,
  config: Config,
  area: AreaRegistryEntry | undefined,
  sensorClasses: string[],
): boolean => {
  if (hasFeature(config, 'exclude_default_entities')) return false;

  const deviceClass = state.attributes?.device_class;
  if (
    state.domain !== 'sensor' ||
    !deviceClass ||
    !sensorClasses.includes(deviceClass)
  ) {
    return false;
  }

  const areaHasTemp = !!area?.temperature_entity_id;
  const areaHasHumidity = !!area?.humidity_entity_id;

  const isAreaDefaultTemp =
    areaHasTemp && state.entity_id === area?.temperature_entity_id;
  const isAreaDefaultHumidity =
    areaHasHumidity && state.entity_id === area?.humidity_entity_id;

  // Area default sensors are always included
  if (isAreaDefaultTemp || isAreaDefaultHumidity) {
    return true;
  }

  // Skip non-default temp/humidity sensors when area has configured defaults
  if (
    (deviceClass === 'temperature' && areaHasTemp) ||
    (deviceClass === 'humidity' && areaHasHumidity)
  ) {
    return false;
  }

  return true;
};
