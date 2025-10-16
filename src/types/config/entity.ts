import type { ActionConfig } from '@hass/data/lovelace/config/action';
import type { ComparisonOperator } from '@type/comparison';

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

  /** Threshold-based color configuration */
  thresholds?: ThresholdConfig[];

  /** State-based color configuration */
  states?: StateConfig[];

  /** Action to perform on tap */
  tap_action?: ActionConfig;

  /** Action to perform on hold */
  hold_action?: ActionConfig;

  /** Action to perform on double tap */
  double_tap_action?: ActionConfig;
}

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
  /** Threshold value to compare against entity state */
  threshold: number;

  /** Comparison operator (default: 'gte' for greater than or equal) */
  operator?: ComparisonOperator;

  /** CSS properties to apply to the entity */
  styles?: Record<string, string>;
}

/**
 * Configuration for state-based coloring
 */
export interface StateConfig extends IconProperties {
  /** Entity state value to match exactly */
  state: string;

  /** CSS properties to apply to the entity */
  styles: Record<string, string>;
}
