import { isNumericState } from '@homeassistant-extras/hass/common/number/format_number';
import type { EntityState } from '@type/room';
import type { AveragedSensor } from '@type/sensor';

/**
 * Device classes that add up across a room.
 * Matches Home Assistant's area card (`SUM_DEVICE_CLASSES` in hui-area-card.ts).
 * Other numeric classes (temperature, humidity, illuminance, and so on) stay an average.
 */
export const SUM_DEVICE_CLASSES = [
  'power',
  'apparent_power',
  'reactive_power',
  'energy',
  'reactive_energy',
  'current',
  'gas',
  'monetary',
  'volume',
  'water',
] as const;

const sumDeviceClasses = new Set<string>(SUM_DEVICE_CLASSES);

/**
 * Filters entities by device class and ensures they are numeric
 */
const getNumericEntitiesByClass = (
  entities: EntityState[],
  deviceClass: string,
): EntityState[] => {
  return entities.filter((entity) => {
    const entityDeviceClass = entity.attributes.device_class;
    return (
      typeof entityDeviceClass === 'string' &&
      entityDeviceClass === deviceClass &&
      isNumericState(entity) &&
      entity.state.trim() !== '' &&
      !Number.isNaN(Number(entity.state))
    );
  });
};

/**
 * Groups entities by their unit of measurement
 */
const groupEntitiesByUom = (
  entities: EntityState[],
): Map<string, EntityState[]> => {
  const uomGroups = new Map<string, EntityState[]>();

  for (const entity of entities) {
    const uomAttr = entity.attributes.unit_of_measurement;
    const uom = typeof uomAttr === 'string' ? uomAttr : '';
    if (!uomGroups.has(uom)) {
      uomGroups.set(uom, []);
    }
    uomGroups.get(uom)!.push(entity);
  }

  return uomGroups;
};

/**
 * Aggregates one unit group. Sum classes store the total; everything else stores the mean.
 * The result still uses the `average` field so display code does not need a second value.
 */
const calculateGroupAggregate = (
  groupEntities: EntityState[],
  uom: string,
  deviceClass: string,
): AveragedSensor => {
  const sum = groupEntities.reduce(
    (total, entity) => total + Number(entity.state),
    0,
  );
  const average = sumDeviceClasses.has(deviceClass)
    ? sum
    : sum / groupEntities.length;

  return {
    states: groupEntities,
    uom,
    average,
    device_class: deviceClass,
    domain: 'sensor',
  };
};

/**
 * Processes a single device class and returns averages
 */
const processDeviceClass = (
  entities: EntityState[],
  deviceClass: string,
): AveragedSensor[] => {
  const classEntities = getNumericEntitiesByClass(entities, deviceClass);
  if (classEntities.length === 0) return [];

  const uomGroups = groupEntitiesByUom(classEntities);
  const averages: AveragedSensor[] = [];

  for (const [uom, groupEntities] of uomGroups) {
    if (groupEntities.length > 0) {
      averages.push(calculateGroupAggregate(groupEntities, uom, deviceClass));
    }
  }

  return averages;
};

/**
 * Groups entities by device class and unit, then aggregates each group.
 * Most classes use a mean. Classes in {@link SUM_DEVICE_CLASSES} use a total.
 */
export const calculateAverages = (
  entities: EntityState[],
  deviceClasses: string[],
): AveragedSensor[] => {
  return deviceClasses.flatMap((deviceClass) =>
    processDeviceClass(entities, deviceClass),
  );
};
