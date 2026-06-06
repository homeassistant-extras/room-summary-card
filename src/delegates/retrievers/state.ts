import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
import type { HassEntities } from '@homeassistant-extras/hass/ws/types';
import type { EntityState } from '@type/room';
import memoizeOne from 'memoize-one';

/**
 * Retrieves the state of an entity
 *
 * @param states - The states registry
 * @param entityId - The ID of the entity
 * @param fakeState - Whether to create a fake state if none exists
 * @returns The entity's state or undefined
 */
export const getState = memoizeOne(
  (
    states: HassEntities,
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
            attributes: { friendly_name: '' },
            last_changed: '',
            last_updated: '',
          }
        : undefined);

    if (!state) return undefined;

    const domain = computeDomain(state.entity_id);
    return {
      state: state.state,
      attributes: state.attributes,
      entity_id: state.entity_id,
      last_changed: state.last_changed,
      last_updated: state.last_updated,
      domain,
    };
  },
);
