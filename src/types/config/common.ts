/**
 * @file Common Configuration TypeScript type definitions
 * @description TypeScript type definitions for entity configuration.
 */

import type { StateConfig } from './entity';

/**
 * Configuration for an individual sensor.
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
}
