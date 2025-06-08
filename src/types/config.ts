/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

import type { ActionConfig } from '../hass/data/lovelace/config/action';

/**
 * Configuration settings for entity display and behavior within Home Assistant.
 */
export interface Config {
  /** The area identifier where the entity is located */
  area: string;

  /** The custom area name */
  area_name?: string;

  /** Single entity configuration or entity ID */
  entity?: EntityConfig | string;

  /** Array of entity configurations or entity IDs */
  entities?: (EntityConfig | string)[];

  /** Navigation path for the entity */
  navigate?: string;

  /** List of entity IDs that are experiencing issues */
  problem_entities?: string[];

  /** Array of sensor entity IDs to display in the label area */
  sensors?: string[];

  /** Array of sensor device classes to automatically find and average (default: ['temperature', 'humidity']) */
  sensor_classes?: string[];

  /** Layout of the sensors */
  sensor_layout?: 'default' | 'bottom' | 'stacked';

  /** Custom thresholds for temperature and humidity */
  thresholds?: {
    temperature?: number;
    humidity?: number;
  };

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features =
  | 'hide_climate_label'
  | 'hide_area_stats'
  | 'hide_sensor_icons'
  | 'exclude_default_entities'
  | 'skip_climate_styles'
  | 'skip_entity_styles';

/**
 * Configuration for an individual entity including display and interaction options.
 */
export interface EntityConfig {
  /** Unique identifier for the entity */
  entity_id: string;

  /** Custom icon to display for the entity */
  icon?: string;

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}

/**
 * Combined entity configuration and state information.
 */
export interface EntityInformation {
  /** The entity configuration */
  config: EntityConfig;

  /** The entity state */
  state: EntityState | undefined;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;

  /** Returns the domain portion of the entity_id */
  domain: string;
}

export interface RoomInformation {
  /** The area name */
  area_name: string;
}

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
