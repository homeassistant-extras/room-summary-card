import { isNumericState } from '@hass/common/number/format_number';
import type { EntityState } from '@type/room';
import type { AveragedSensor } from '@type/sensor';

/**
 * Filters entities by device class and ensures they are numeric
 */
const getNumericEntitiesByClass = (
  entities: EntityState[],
  deviceClass: string,
): EntityState[] => {
  return entities.filter(
    (entity) =>
      entity.attributes.device_class === deviceClass &&
      isNumericState(entity) &&
      entity.state.trim() !== '' &&
      !isNaN(Number(entity.state)),
  );
};

/**
 * Groups entities by their unit of measurement
 */
const groupEntitiesByUom = (
  entities: EntityState[],
): Map<string, EntityState[]> => {
  const uomGroups = new Map<string, EntityState[]>();

  for (const entity of entities) {
    const uom = entity.attributes.unit_of_measurement ?? '';
    if (!uomGroups.has(uom)) {
      uomGroups.set(uom, []);
    }
    uomGroups.get(uom)!.push(entity);
  }

  return uomGroups;
};

/**
 * Calculates average for a group of entities
 */
const calculateGroupAverage = (
  groupEntities: EntityState[],
  uom: string,
  deviceClass: string,
): AveragedSensor => {
  const sum = groupEntities.reduce(
    (total, entity) => total + Number(entity.state),
    0,
  );
  const average = sum / groupEntities.length;

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
      averages.push(calculateGroupAverage(groupEntities, uom, deviceClass));
    }
  }

  return averages;
};

/**
 * Groups entities by their device class and calculates averages
 */
export const calculateAverages = (
  entities: EntityState[],
  deviceClasses: string[],
): AveragedSensor[] => {
  return deviceClasses.flatMap((deviceClass) =>
    processDeviceClass(entities, deviceClass),
  );
};
