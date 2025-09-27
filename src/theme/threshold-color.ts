import type { ThresholdConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';

/**
 * Result of threshold/state evaluation containing both color and icon
 */
export interface ThresholdResult {
  /** The color to apply */
  color?: string;
  /** The icon to apply */
  icon?: string;
}

/**
 * Evaluates threshold conditions and returns the appropriate result
 *
 * @param entity - The entity information containing state and config
 * @returns ThresholdResult with color and icon if a threshold matches, undefined otherwise
 */
export const getThresholdResult = (
  entity: EntityInformation,
): ThresholdResult | undefined => {
  const { config, state } = entity;

  if (!state) {
    return undefined;
  }

  // Check state-based result configuration first
  const stateResult = getStateResult(entity);
  if (stateResult) {
    return stateResult;
  }

  // Fallback to threshold-based configuration
  if (!config.thresholds) {
    return undefined;
  }

  const numericValue = parseFloat(state.state);

  // Skip if state is not a valid number
  if (isNaN(numericValue)) {
    return undefined;
  }

  // Sort thresholds by value in descending order to check highest first
  const sortedThresholds = [...config.thresholds].sort(
    (a, b) => b.threshold - a.threshold,
  );

  for (const threshold of sortedThresholds) {
    if (meetsThreshold(numericValue, threshold)) {
      return {
        color: threshold.icon_color,
        icon: threshold.icon,
      };
    }
  }

  return undefined;
};

/**
 * Evaluates threshold conditions and returns the appropriate color
 * @deprecated Use getThresholdResult() instead for both color and icon
 */
export const getThresholdColor = (
  entity: EntityInformation,
): string | undefined => {
  return getThresholdResult(entity)?.color;
};

/**
 * Evaluates state-based configuration and returns the appropriate result
 *
 * @param entity - The entity information containing state and config
 * @returns ThresholdResult with color and icon if a state matches, undefined otherwise
 */
export const getStateResult = (
  entity: EntityInformation,
): ThresholdResult | undefined => {
  const { config, state } = entity;

  if (!config.states || !state) {
    return undefined;
  }

  const currentState = state.state;

  for (const stateConfig of config.states) {
    if (stateConfig.state === currentState) {
      return {
        color: stateConfig.icon_color,
        icon: stateConfig.icon,
      };
    }
  }

  return undefined;
};

/**
 * Evaluates state-based color configuration and returns the appropriate color
 * @deprecated Use getStateResult() instead for both color and icon
 */
export const getStateColor = (
  entity: EntityInformation,
): string | undefined => {
  return getStateResult(entity)?.color;
};

/**
 * Checks if a numeric value meets a threshold condition
 *
 * @param value - The numeric value to test
 * @param threshold - The threshold configuration
 * @returns true if the condition is met
 */
const meetsThreshold = (value: number, threshold: ThresholdConfig): boolean => {
  const operator = threshold.operator || 'gte';

  switch (operator) {
    case 'gt':
      return value > threshold.threshold;
    case 'gte':
      return value >= threshold.threshold;
    case 'lt':
      return value < threshold.threshold;
    case 'lte':
      return value <= threshold.threshold;
    case 'eq':
      return value === threshold.threshold;
    default:
      return value >= threshold.threshold;
  }
};

/**
 * Gets the icon override from threshold/state configuration
 *
 * @param entity - The entity information containing state and config
 * @returns The icon string if a condition matches, undefined otherwise
 * @deprecated Use getThresholdResult() instead for both color and icon
 */
export const getThresholdIcon = (
  entity: EntityInformation,
): string | undefined => {
  return getThresholdResult(entity)?.icon;
};
