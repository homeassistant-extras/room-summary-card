/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

import type { ActionConfig } from './action';
import type { State } from './homeassistant';

/**
 * Configuration settings for entity display and behavior within Home Assistant.
 */
export interface Config {
  /** The area identifier where the entity is located */
  area: string;

  /** Single entity configuration or entity ID */
  entity?: EntityConfig | string;

  /** Array of entity configurations or entity IDs */
  entities?: (EntityConfig | string)[];

  /** List of entity IDs that are experiencing issues */
  problem_entities?: string[];

  /** Flag to disable climate-based color coding */
  skip_climate_colors?: boolean;

  /** Navigation path for the entity */
  navigate?: string;

  /** Entity ID for humidity sensor */
  humidity_sensor?: string;

  /** Entity ID for temperature sensor */
  temperature_sensor?: string;

  /** Options to enable disable features **/
  features?: Features[];
}

export type Features =
  | 'hide_climate_label'
  | 'hide_area_stats'
  | 'exclude_default_entities';

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
  config: EntityConfig;
  state: State | undefined;
}
