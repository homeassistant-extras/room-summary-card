import type { BadgeConfig, StateConfig } from '@type/config/entity';
import type { EntityState } from '@type/room';
import { meetsStateCondition } from '@util/comparison-utils';

/**
 * Gets the matching badge state configuration for a badge
 *
 * @param state - The entity state
 * @param badge - The badge configuration
 * @returns The matching StateConfig if found, undefined otherwise
 */
export const getMatchingBadgeState = (
  state: EntityState,
  badge: BadgeConfig,
): StateConfig | undefined => {
  if (!badge.states || !state) {
    return undefined;
  }

  for (const stateConfig of badge.states) {
    // Determine what value to compare against
    const valueToMatch = stateConfig.attribute
      ? String(state.attributes?.[stateConfig.attribute] ?? '')
      : state.state;

    const operator = stateConfig.operator || 'eq';

    if (meetsStateCondition(valueToMatch, stateConfig.state, operator)) {
      return stateConfig;
    }
  }

  return undefined;
};
