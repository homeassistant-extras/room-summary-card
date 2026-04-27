import type { ComparisonOperator } from '@type/comparison';
import type { BaseEntityConfig } from './common';

/**
 * Configuration for an individual entity, including display and interaction options.
 */
export interface EntityConfig extends BaseEntityConfig {
  /** Custom color for the on state */
  on_color?: string;

  /** Custom color for the off state */
  off_color?: string;

  /** Features to enable or disable for the entity */
  features?: EntityFeatures[];

  /** CSS properties to apply to the entity */
  styles?: Record<string, string>;

  /** Badge configurations for displaying overlay icons */
  badges?: BadgeConfig[];

  /** Per-entity slider configuration. */
  slider?: SliderConfig;
}

/** Features to enable or disable for the entity */
export type EntityFeatures =
  | 'use_entity_icon'
  | 'show_state'
  | 'hide_zero_attribute_domains';

/** Visual style of the horizontal slider. */
export type HorizontalSliderStyle = 'ha' | 'bar';

/**
 * Per-entity configuration for the horizontal slider. Reserved for
 * options that are scoped to a single slider instance (currently just
 * the visual style; future candidates: min/max overrides, color, etc.).
 */
export interface SliderConfig {
  /** Visual variant of the rendered slider. Defaults to `'bar'`. */
  style?: HorizontalSliderStyle;

  /**
   * When `true`, the entity that drives this slider is omitted from the
   * regular icon grid. Handy when you already list the entity in
   * `entities` (so its defaults apply, badges, etc.) but want it to be
   * represented only by the bottom slider strip, not by a room-state-icon.
   */
  hide_icon?: boolean;
}

/**
 * Common icon properties for state and threshold configurations
 */
export interface IconStyleProperties {
  /** Color to use when this condition is met */
  icon_color?: string;

  /** Color to use for the title when this condition is met if applicable */
  title_color?: string;

  /** Icon to use when this condition is met */
  icon?: string;

  /** Optional attribute name to match instead of entity state */
  attribute?: string;

  /** Custom label to display when this state matches if applicable */
  label?: string;

  /** CSS properties to apply to the entity */
  styles?: Record<string, string>;

  /** Comparison operator (default: 'eq' for states, 'gte' for thresholds) */
  operator?: ComparisonOperator;
}

/**
 * Configuration for threshold-based coloring
 */
export interface ThresholdConfig extends IconStyleProperties {
  /** Threshold value to compare against entity state or attribute */
  threshold: number;
}

/**
 * Configuration for state-based coloring
 */
export interface StateConfig extends IconStyleProperties {
  /** Entity state or attribute value to match exactly */
  state: string;
}

/**
 * Configuration for entity badges
 */
export interface BadgeConfig {
  /** Optional entity ID (defaults to parent entity) */
  entity_id?: string;

  /** Badge position: top_right, top_left, bottom_right, bottom_left */
  position?: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';

  /** State-based badge configuration (reuses StateConfig type) */
  states?: StateConfig[];

  /** Badge display mode */
  mode?: 'show_always' | 'if_match' | 'homeassistant';
}
