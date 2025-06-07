import type {
  AveragedSensor,
  DisplaySensor,
  EntityState,
  SensorData,
} from '@type/config';

/**
 * Formats a number with appropriate decimal places
 */
const formatNumber = (value: number, maxDecimals: number = 1): string => {
  return value.toFixed(maxDecimals).replace(/\.?0+$/, '');
};

/**
 * Adds appropriate spacing before unit if needed
 */
const blankBeforeUnit = (unit: string): string => {
  // Units that don't need a space (like % or °)
  const noSpaceUnits = ['%', '°C', '°F'];
  return noSpaceUnits.some((u) => unit.includes(u)) ? '' : ' ';
};

/**
 * Converts an averaged sensor to a display sensor
 */
const averagedToDisplaySensor = (averaged: AveragedSensor): DisplaySensor => {
  const formattedValue = formatNumber(averaged.average);
  const spacing = blankBeforeUnit(averaged.uom);
  const displayState = `${formattedValue}${spacing}${averaged.uom}`;

  return {
    value: displayState,
    device_class: averaged.device_class,
    domain: 'sensor',
    is_averaged: true,
  };
};

/**
 * Converts an individual entity state to a display sensor
 */
const entityToDisplaySensor = (entity: EntityState): DisplaySensor => {
  return {
    state: entity,
    domain: entity.domain,
    is_averaged: false,
    device_class: entity.attributes.device_class || 'sensor',
  };
};

/**
 * Converts sensor data to an array of display sensors
 * Individual sensors come first, followed by averaged sensors
 */
export const sensorDataToDisplaySensors = (
  sensorData: SensorData,
): DisplaySensor[] => {
  const displaySensors: DisplaySensor[] = [];

  // Add individual sensors first
  sensorData.individual.forEach((entity) => {
    displaySensors.push(entityToDisplaySensor(entity));
  });

  // Add averaged sensors
  sensorData.averaged.forEach((averaged) => {
    displaySensors.push(averagedToDisplaySensor(averaged));
  });

  return displaySensors;
};
