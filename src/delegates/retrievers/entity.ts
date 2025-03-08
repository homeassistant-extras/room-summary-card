import type { EntityRegistryDisplayEntry } from '@hass/data/entity_registry';
import type { HomeAssistant } from '@hass/types';

/**
 * Retrieves entity information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} entityId - The ID of the entity
 * @returns {Entity} The entity information
 */

export const getEntity = (
  hass: HomeAssistant,
  entityId: string,
): EntityRegistryDisplayEntry =>
  (hass.entities as { [key: string]: any })[entityId];
