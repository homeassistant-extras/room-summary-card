import type { ComparisonOperator } from '@type/comparison';
import type { ThresholdConfig } from '@type/config/entity';

/**
 * Checks if a string value meets a state condition using the specified operator
 *
 * @param value - The string value to test
 * @param stateValue - The state value to compare against
 * @param operator - The comparison operator to use
 * @returns true if the condition is met
 */
export const meetsStateCondition = (
  value: string,
  stateValue: string,
  operator: ComparisonOperator,
): boolean => {
  switch (operator) {
    case 'eq':
      return value === stateValue;
    case 'ne':
      return value !== stateValue;
    default:
      // Default to eq for backward compatibility
      return value === stateValue;
  }
};

/**
 * Checks if a numeric value meets a threshold condition
 *
 * @param value - The numeric value to test
 * @param threshold - The threshold configuration
 * @returns true if the condition is met
 */
export const meetsThreshold = (
  value: number,
  threshold: ThresholdConfig,
): boolean => {
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
