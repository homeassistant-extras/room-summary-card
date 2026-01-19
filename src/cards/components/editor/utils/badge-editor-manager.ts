import type { BadgeConfig } from '@type/config/entity';

/**
 * Creates a new badge configuration
 */
export function createNewBadge(): BadgeConfig {
  return {
    position: 'top_right',
  };
}

/**
 * Adds a new badge to the badges array
 */
export function addBadge(badges: BadgeConfig[] | undefined): BadgeConfig[] {
  return [...(badges || []), createNewBadge()];
}

/**
 * Adjusts expanded badge indices after removing a badge
 */
export function adjustExpandedIndicesAfterRemoval(
  expandedBadges: Set<number>,
  removedIndex: number,
): Set<number> {
  const newExpanded = new Set(expandedBadges);
  newExpanded.delete(removedIndex);

  const adjustedExpanded = new Set<number>();
  for (const idx of newExpanded) {
    if (idx > removedIndex) {
      adjustedExpanded.add(idx - 1);
    } else {
      adjustedExpanded.add(idx);
    }
  }
  return adjustedExpanded;
}

/**
 * Removes a badge at the specified index
 */
export function removeBadgeItem(
  badges: BadgeConfig[] | undefined,
  index: number,
): BadgeConfig[] {
  const newBadges = (badges || []).concat();
  newBadges.splice(index, 1);
  return newBadges.length > 0 ? newBadges : [];
}
