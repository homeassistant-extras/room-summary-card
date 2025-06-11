import type { AveragedSensor } from '@type/config';

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
 * Converts an `AveragedSensor` object into a formatted string suitable for display.
 *
 * The output string consists of the formatted average value, an optional space (if required)
 * before the unit of measurement, and the unit itself.
 *
 * @param averagedSensor - The sensor data object containing the average value and unit of measurement.
 * @returns A string representing the sensor's average value and unit, formatted for display.
 */
export const sensorDataToDisplaySensors = (averagedSensor: AveragedSensor) =>
  `${formatNumber(averagedSensor.average)}${blankBeforeUnit(averagedSensor.uom)}${averagedSensor.uom}`;
