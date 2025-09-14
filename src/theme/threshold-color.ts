import type { EntityInformation } from '@type/room';
import type { ThresholdConfig } from '@type/config';

/**
 * Evaluates threshold conditions and returns the appropriate color
 *
 * @param entity - The entity information containing state and config
 * @returns The color string if a threshold matches, undefined otherwise
 */
export const getThresholdColor = (entity: EntityInformation): string | undefined => {
  const { config, state } = entity;

  if (!config.thresholds || !state) {
    return undefined;
  }

  const numericValue = parseFloat(state.state);

  // Skip if state is not a valid number
  if (isNaN(numericValue)) {
    return undefined;
  }

  // Sort thresholds by value in descending order to check highest first
  const sortedThresholds = [...config.thresholds].sort((a, b) => b.threshold - a.threshold);

  for (const threshold of sortedThresholds) {
    if (meetsThreshold(numericValue, threshold)) {
      return threshold.icon_color;
    }
  }

  return undefined;
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