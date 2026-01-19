import type { BadgeConfig } from '@type/config/entity';
import { BadgeEditorUtils } from './badge-editor-utils';

/**
 * Event handler functions for badge row editor
 */
export class BadgeEditorHandlers {
  /**
   * Handles badge value change events
   */
  static badgeValueChanged(
    badges: BadgeConfig[] | undefined,
    index: number,
    updatedBadge: any,
  ): BadgeConfig[] {
    const newBadges = (badges || []).concat();
    if (updatedBadge && typeof updatedBadge === 'object') {
      const cleanedBadge = BadgeEditorUtils.cleanEmptyStrings(updatedBadge);
      newBadges[index] = cleanedBadge;
    }
    return newBadges;
  }

  /**
   * Handles badge states value change events
   */
  static badgeStatesValueChanged(
    badges: BadgeConfig[] | undefined,
    index: number,
    statesValue: any,
  ): BadgeConfig[] {
    const newBadges = (badges || []).concat();

    if (!Array.isArray(statesValue)) {
      console.warn('Badge states value is not an array:', statesValue);
      return newBadges;
    }

    const cleanedStates = statesValue.map((state) =>
      BadgeEditorUtils.cleanEmptyStrings(state),
    );

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
}
