import type { EntityRegistryDisplayEntry } from '@hass/data/entity_registry';
const memoizeOne = require('memoize-one');

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
