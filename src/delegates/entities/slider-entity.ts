/**
 * @file Slider entity discovery
 * @description Finds the first config entity that declares a `slider`
 * config block. Scans the main `entity` first, then `entities` in order.
 * Plain string entries are skipped (no metadata to inspect).
 *
 * Returns the full `EntityConfig` (rather than just the id) so callers
 * can read both `entity_id` and the per-entity `slider` block.
 */

import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';

/**
 * Returns the first entity in the card config that has a `slider` block,
 * or `undefined` if none qualify.
 */
export const getSliderEntity = (
  config: Config | undefined,
): EntityConfig | undefined => {
  if (!config) return undefined;

  const candidates: (EntityConfig | string | undefined)[] = [
    config.entity,
    ...(config.entities ?? []),
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && c.slider !== undefined) {
      return c;
    }
  }

  return undefined;
};
