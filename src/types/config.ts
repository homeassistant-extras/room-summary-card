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

  /** Occupancy detection configuration */
  occupancy?: OccupancyConfig;

  /** Custom thresholds for temperature and humidity */
  thresholds?: {
    /** Temperature threshold value */
    temperature?: number;

    /** Humidity threshold value */
    humidity?: number;

    /** Temperature entity ID for dynamic thresholds */
    temperature_entity?: string;

    /** Humidity entity ID for dynamic thresholds */
    humidity_entity?: string;
  };

  background?: {
    /** URL of the background image */
    image?: string;

    /** Entity ID for dynamic background images */
    image_entity?: string;

    /** Opacity level for the background image (0 to 1) */
    opacity?: number;

    /** Background options */
    options?: ('disable' | 'icon_background')[];
  };

  /** Custom styling configuration */
  styles?: {
    /** CSS properties for the card container */
    card?: Record<string, string>;

    /** CSS properties for the entities container */
    entities?: Record<string, string>;

    /** Sensor CSS properties as an object */
    sensors?: Record<string, string>;

    /** CSS properties for the stats area */
    stats?: Record<string, string>;

    /** Title CSS properties as an object */
    title?: Record<string, string>;
  };

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features =
  | 'debug'
  | 'hide_area_stats'
  | 'hide_climate_label'
  | 'hide_room_icon'
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

  /** Custom color for the on state */
  on_color?: string;

  /** Custom color for the off state */
  off_color?: string;

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}

/**
 * @file Occupancy Configuration Types
 * @description TypeScript type definitions for occupancy detection features.
 */

/**
 * Configuration for occupancy-based visual indicators
 */
export interface OccupancyConfig {
  /** Entity IDs for motion/occupancy sensors (required) */
  entities: string[];

  /** Color for card border when occupied */
  card_border_color?: string;

  /** Color for room icon background when occupied */
  icon_color?: string;

  /** Array of features to disable */
  options?: (
    | 'disabled_card_styles'
    | 'disabled_card_styles_animation'
    | 'disable_icon_styles'
    | 'disable_icon_animation'
  )[];
}
