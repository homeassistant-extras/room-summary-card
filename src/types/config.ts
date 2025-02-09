/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

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
  /** Flag to disable fan functionality */
  remove_fan?: boolean;
  /** Flag to disable climate-based color coding */
  skip_climate_colors?: boolean;
  /** Navigation path for the entity */
  navigate?: string;
  /** Entity ID for humidity sensor */
  humidity_sensor?: string;
  /** Entity ID for temperature sensor */
  temperature_sensor?: string;
  /** Options to enable disable featurs **/
  options?: OptionsConfig;
}

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

export interface OptionsConfig {
  /** Flag to show the climate labels or not */
  label?: boolean;
}

/**
 * Action configuration for navigation events.
 */
export interface NavigateActionConfig extends BaseActionConfig {
  action: 'navigate';
  /** Path to navigate to when action is triggered */
  navigation_path: string;
}

/**
 * Action configuration for toggle events.
 */
export interface ToggleActionConfig extends BaseActionConfig {
  action: 'toggle';
}

/**
 * Action configuration for displaying more information.
 */
export interface MoreInfoActionConfig extends BaseActionConfig {
  action: 'more-info';
}

/**
 * Action configuration for no-operation events.
 */
export interface NoActionConfig extends BaseActionConfig {
  action: 'none';
}

/**
 * Base configuration for all action types.
 */
export interface BaseActionConfig {
  action: string;
}

/**
 * Union type of all possible action configurations.
 */
export type ActionConfig =
  | ToggleActionConfig
  | NavigateActionConfig
  | NoActionConfig
  | MoreInfoActionConfig;

/**
 * Parameters for configuring entity actions.
 */
export type ActionConfigParams = {
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};

/**
 * Combined entity configuration and state information.
 */
export interface EntityInformation {
  config: EntityConfig;
  state: State | undefined;
}
