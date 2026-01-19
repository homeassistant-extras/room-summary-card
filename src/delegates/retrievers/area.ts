import type { AreaRegistryEntry } from '@hass/data/area/area_registry';
import memoizeOne from 'memoize-one';

/**
 * Retrieves area information
 *
 * @param areas - The areas object from Home Assistant
 * @param areaId - The area ID
 * @returns {Area | undefined} The area information
 */
export const getArea = memoizeOne(
  (
    areas: Record<string, AreaRegistryEntry>,
    areaId: string,
  ): AreaRegistryEntry | undefined => areas[areaId],
);
