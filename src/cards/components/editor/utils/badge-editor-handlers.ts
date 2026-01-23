import type { BadgeConfig } from '@type/config/entity';
import { cleanEmptyStrings } from './badge-editor-utils';

/**
 * Handles badge value change events
 */
export function badgeValueChanged(
  badges: BadgeConfig[] | undefined,
  index: number,
  updatedBadge: any,
): BadgeConfig[] {
  const newBadges = (badges || []).concat();
  if (updatedBadge && typeof updatedBadge === 'object') {
    const cleanedBadge = cleanEmptyStrings(updatedBadge);
    newBadges[index] = cleanedBadge;
  }
  return newBadges;
}

/**
 * Handles badge states value change events
 */
export function badgeStatesValueChanged(
  badges: BadgeConfig[] | undefined,
  index: number,
  statesValue: any,
): BadgeConfig[] {
  const newBadges = (badges || []).concat();

  if (!Array.isArray(statesValue)) {
    console.warn('Badge states value is not an array:', statesValue);
    return newBadges;
  }

  const cleanedStates = statesValue.map((state) => cleanEmptyStrings(state));

  newBadges[index] = {
    ...newBadges[index],
    ...(cleanedStates.length > 0 ? { states: cleanedStates } : {}),
  };

  // Remove states property if empty
  if (cleanedStates.length === 0 && 'states' in newBadges[index]) {
    delete newBadges[index].states;
  }

  return newBadges;
}
