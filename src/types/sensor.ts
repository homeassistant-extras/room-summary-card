import type { EntityState } from './room';

/**
 * Represents an averaged sensor reading for a specific device class
 */

export interface AveragedSensor {
  /** Array of entity states that were averaged */
  states: EntityState[];

  /** Unit of measurement */
  uom: string;

  /** Averaged value */
  average: number;

  /** Device class (e.g., 'temperature', 'humidity') */
  device_class: string;

  /** Sensor domain (typically 'sensor') */
  domain: string;
}
/**
 * Result from getSensors containing both individual sensors and averaged sensors
 */

export interface SensorData {
  /** Individual sensors specified in config.sensors */
  individual: EntityState[];

  /** Averaged sensors grouped by device class */
  averaged: AveragedSensor[];

  /** Problem entities in the area */
  problemSensors: EntityState[];

  /** Mold sensor in the area */
  mold?: EntityState;

  /** Light entities in the area (for multi-light background feature) */
  lightEntities: EntityState[];

  /** Ambient light entities that only affect the background, not the icon/title */
  ambientLightEntities: EntityState[];

  /** Threshold sensor */
  thresholdSensors: EntityState[];
}
/**
 * Represents a display-ready sensor that can be either individual or averaged
 */

export interface DisplaySensor {
  /** Entity state (undefined for averaged sensors) */
  state?: EntityState;

  /** Display state value (undefined for individual sensors) */
  value?: string;

  /** Sensor domain */
  domain: string;

  /** Device class (e.g., 'temperature', 'humidity') */
  device_class: string;
}
