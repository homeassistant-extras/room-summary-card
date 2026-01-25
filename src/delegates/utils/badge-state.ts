import { meetsStateCondition } from '@util/comparison-utils';
import type { BadgeConfig, StateConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';

/**
 * Gets the matching badge state configuration for a badge
 *
 * @param entity - The entity information containing state
 * @param badge - The badge configuration
 * @returns The matching StateConfig if found, undefined otherwise
 */
export const getMatchingBadgeState = (
  entity: EntityInformation,
  badge: BadgeConfig,
): StateConfig | undefined => {
  const { state } = entity;

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
