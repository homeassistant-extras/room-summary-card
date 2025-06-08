import { getState } from '@delegates/retrievers/state';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';

/**
 * Gets entities with problems in a specific area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} area - The area to check for problems
 * @returns {Object} Object containing problem entities and existence flag
 */
export const getProblemEntities = (
  hass: HomeAssistant,
  area: string,
): {
  problemEntities: string[];
  problemExists: boolean;
} => {
  // Find entities labeled as problems in the specified area
  const problemEntities = Object.values(hass.entities)
    .filter((entity) => {
      if (!entity?.labels?.includes('problem')) return false;

      const device = hass.devices?.[entity.device_id];
      return [entity.area_id, device?.area_id].includes(area);
    })
    .map((entity) => entity.entity_id);

  // Check if any problem entities are currently active
  const problemExists = problemEntities.some((entityId) => {
    const entityState = getState(hass.states, entityId);
    if (!entityState) return false;
    const active = stateActive(entityState);
    return active;
  });

  return {
    problemEntities,
    problemExists,
  };
};
