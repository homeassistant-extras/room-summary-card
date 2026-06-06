import type { EntityRegistryDisplayEntry } from '@homeassistant-extras/hass/data/entity/entity_registry';
import memoizeOne from 'memoize-one';

/**
 * Retrieves entity information
 *
 * @param {Record<string, EntityRegistryDisplayEntry>} entities - The entities registry
 * @param {string} entityId - The ID of the entity
 * @returns {EntityRegistryDisplayEntry} The entity information
 */
export const getEntity = memoizeOne(
  (
    entities: Record<string, EntityRegistryDisplayEntry>,
    entityId: string,
  ): EntityRegistryDisplayEntry | undefined => entities[entityId],
);
