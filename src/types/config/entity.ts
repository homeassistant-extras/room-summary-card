import type { ActionConfig } from '@hass/data/lovelace/config/action';
import type { ComparisonOperator } from '@type/comparison';
import type { BaseEntityConfig } from './common';

/**
 * Configuration for an individual entity, including display and interaction options.
 */
export interface EntityConfig extends BaseEntityConfig {
  /** Custom icon to display for the entity */
  icon?: string;

  /** Custom color for the on state */
  on_color?: string;

  /** Custom color for the off state */
  off_color?: string;

  /** Threshold-based color configuration */
  thresholds?: ThresholdConfig[];

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;

  /** Features to enable or disable for the entity */
  features?: EntityFeatures[];
}

/** Features to enable or disable for the entity */
export type EntityFeatures = 'use_entity_icon';

/**
 * Common icon properties for state and threshold configurations
 */
export interface IconProperties {
  /** Color to use when this condition is met */
  icon_color: string;

  /** Icon to use when this condition is met */
  icon?: string;
}

/**
 * Configuration for threshold-based coloring
 */
export interface ThresholdConfig extends IconProperties {
  /** Threshold value to compare against entity state or attribute */
  threshold: number;

  /** Comparison operator (default: 'gte' for greater than or equal) */
  operator?: ComparisonOperator;

  /** Optional attribute name to compare instead of entity state */
  attribute?: string;

  /** CSS properties to apply to the entity */
  styles?: Record<string, string>;
}

/**
 * Configuration for state-based coloring
 */
export interface StateConfig extends IconProperties {
  /** Entity state or attribute value to match exactly */
  state: string;

  /** Optional attribute name to match instead of entity state */
  attribute?: string;

  /** CSS properties to apply to the entity */
  styles: Record<string, string>;
}
