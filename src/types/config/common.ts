/**
 * @file Common Configuration TypeScript type definitions
 * @description TypeScript type definitions for entity configuration.
 */

import type { ActionConfig } from '@hass/data/lovelace/config/action';
import type { StateConfig, ThresholdConfig } from './entity';

/**
 * Base configuration for entities and sensors
 */
export interface BaseEntityConfig {
  /** Unique identifier for the sensor entity */
  entity_id: string;

  /** Custom label to display instead of default state display */
  label?: string;

  /** Attribute to display instead of entity state */
  attribute?: string;

  /** Custom icon to display for the entity */
  icon?: string;

  /** State-based color and icon configuration */
  states?: StateConfig[];

  /** Threshold-based color configuration */
  thresholds?: ThresholdConfig[];

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}
