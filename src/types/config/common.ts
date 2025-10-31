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

  /** State-based color and icon configuration */
  states?: StateConfig[];
}
