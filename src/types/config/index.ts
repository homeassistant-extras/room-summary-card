/**
 * @file Card Configuration TypeScript type definitions
 * @description Core type definitions for card configuration.
 */

import type { ComparisonOperator } from '../comparison';
import type { EntityConfig } from './entity';
import type { SensorConfig } from './sensor';

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

  /** Array of sensor entity IDs or sensor configurations to display in the label area */
  sensors?: (string | SensorConfig)[];

  /** Array of sensor device classes to automatically find and average (default: ['temperature', 'humidity']) */
  sensor_classes?: string[];

  /** Layout of the sensors */
  sensor_layout?: 'default' | 'bottom' | 'stacked';

  /** Visual style of the slider control */
  slider_style?:
    | 'track'
    | 'minimalist'
    | 'line'
    | 'filled'
    | 'gradient'
    | 'dual-rail'
    | 'dots'
    | 'notched'
    | 'grid'
    | 'glow'
    | 'shadow-trail'
    | 'outlined';

  /** Occupancy detection configuration */
  occupancy?: AlarmConfig;

  /** Smoke detection configuration */
  smoke?: AlarmConfig;

  /** Custom thresholds for temperature and humidity */
  thresholds?: {
    /** Temperature threshold value or entity ID */
    temperature?: number | string;

    /** Humidity threshold value or entity ID */
    humidity?: number | string;

    /** Mold threshold value (percentage) */
    mold?: number;

    /** Temperature entity ID for dynamic thresholds */
    temperature_entity?: string;

    /** Humidity entity ID for dynamic thresholds */
    humidity_entity?: string;

    /** Temperature comparison operator (default: 'gt' for greater than) */
    temperature_operator?: ComparisonOperator;

    /** Humidity comparison operator (default: 'gt' for greater than) */
    humidity_operator?: ComparisonOperator;
  };

  background?: {
    /** URL of the background image or media source object */
    image?:
      | string
      | {
          media_content_id: string;
          media_content_type?: string;
          metadata?: Record<string, any>;
        };

    /** Entity ID for dynamic background images */
    image_entity?: string;

    /** Opacity level for the background image (0 to 1) */
    opacity?: number;

    /** Background options */
    options?: ('disable' | 'icon_background' | 'hide_icon_only')[];
  };

  /** Light entities to track for multi-light background (overrides automatic discovery) */
  lights?: string[];

  /** Custom styling configuration */
  styles?: {
    /** CSS properties for the card container */
    card?: Record<string, string>;

    /** CSS properties for the entities container */
    entities?: Record<string, string>;

    /** CSS properties for individual entity icons */
    entity_icon?: Record<string, string>;

    /** Sensor CSS properties as an object */
    sensors?: Record<string, string>;

    /** CSS properties for the stats area */
    stats?: Record<string, string>;

    /** Title CSS properties as an object */
    title?: Record<string, string>;
  };

  /** Options to enable or disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features =
  | 'debug'
  | 'hide_area_stats'
  | 'hide_climate_label'
  | 'hide_room_icon'
  | 'hide_sensor_icons'
  | 'hide_sensor_labels'
  | 'ignore_entity'
  | 'exclude_default_entities'
  | 'skip_climate_styles'
  | 'skip_entity_styles'
  | 'show_entity_labels'
  | 'multi_light_background'
  | 'sticky_entities'
  | 'slider';

/**
 * @file Occupancy Configuration Types
 * @description TypeScript type definitions for occupancy detection features.
 */

/**
 * Configuration for occupancy-based visual indicators
 */
export interface AlarmConfig {
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
