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
  /** The label to display */
  label?: string;
  /** The CSS properties to apply to the entity */
  styles?: Record<string, string>;
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

  // Sort thresholds by value in descending order to check highest first
  const sortedThresholds = [...config.thresholds].sort(
    (a, b) => b.threshold - a.threshold,
  );

  for (const threshold of sortedThresholds) {
    // Determine what value to compare against
    const valueToCompare = threshold.attribute
      ? state.attributes?.[threshold.attribute]
      : state.state;

    const numericValue = Number.parseFloat(String(valueToCompare ?? ''));

    // Skip if value is not a valid number
    if (Number.isNaN(numericValue)) {
      continue;
    }

    if (meetsThreshold(numericValue, threshold)) {
      return {
        color: threshold.icon_color,
        icon: threshold.icon,
        label: threshold.label,
        styles: threshold.styles,
      };
    }
  }

  return undefined;
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

  for (const stateConfig of config.states) {
    // Determine what value to compare against
    const valueToMatch = stateConfig.attribute
      ? String(state.attributes?.[stateConfig.attribute] ?? '')
      : state.state;

    if (stateConfig.state === valueToMatch) {
      return {
        color: stateConfig.icon_color,
        icon: stateConfig.icon,
        label: stateConfig.label,
        styles: stateConfig.styles,
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
 * Gets the label for an entity with proper priority:
 * 1. State/threshold result label (if a matching state/threshold has a label)
 * 2. Config label (if configured at the entity level)
 *
 * @param entity - The entity information containing state and config
 * @param result - The threshold/state result (optional)
 * @returns The label to display, or undefined if none is configured
 */
export const getEntityLabel = (
  entity: EntityInformation,
  result?: ThresholdResult,
): string | undefined => {
  // First priority: label from state/threshold result
  if (result?.label) {
    return result.label;
  }

  // Second priority: label from config
  return entity.config.label;
};
