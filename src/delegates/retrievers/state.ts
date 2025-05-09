import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';

/**
 * Retrieves the state of an entity
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} [entityId] - The ID of the entity
 * @param {boolean} [fakeState=false] - Whether to create a fake state if none exists
 * @returns {State | undefined} The entity's state or undefined
 */

export const getState = (
  hass: HomeAssistant,
  entityId?: string,
  fakeState: boolean = false,
): EntityState | undefined => {
  if (!entityId) return undefined;

  const state =
    (hass.states as { [key: string]: any })[entityId] ??
    (fakeState
      ? { entity_id: entityId, state: 'off', attributes: {} }
      : undefined);

  if (!state) return undefined;

  const domain = computeDomain(state.entity_id);
  return {
    state: state.state,
    attributes: state.attributes,
    entity_id: state.entity_id,
    domain,
  };
};
