import { computeDomain } from '@hass/common/entity/compute_domain';
import type { EntityState } from '@type/room';
import memoizeOne from 'memoize-one';

/**
 * Retrieves the state of an entity
 *
 * @param {Record<string, any>} states - The states registry
 * @param {string} [entityId] - The ID of the entity
 * @param {boolean} [fakeState=false] - Whether to create a fake state if none exists
 * @returns {EntityState | undefined} The entity's state or undefined
 */
export const getState = memoizeOne(
  (
    states: Record<string, any>,
    entityId?: string,
    fakeState: boolean = false,
  ): EntityState | undefined => {
    if (!entityId) return undefined;

    const state =
      states[entityId] ??
      (fakeState
        ? {
            entity_id: entityId,
            state: 'off',
            // Set friendly_name to an empty string so the label is blank
            attributes: { friendly_name: '' },
          }
        : undefined);

    if (!state) return undefined;

    const domain = computeDomain(state.entity_id);
    return {
      state: state.state,
      attributes: state.attributes,
      entity_id: state.entity_id,
      domain,
    };
  },
);
