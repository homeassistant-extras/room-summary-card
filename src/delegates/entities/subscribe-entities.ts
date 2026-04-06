/**
 * Shared helpers for processing subscribe_entities state diff format.
 * Used by entity-subscription-manager.
 *
 * @see https://developers.home-assistant.io/docs/api/websocket#subscribe_entities
 */

import { computeDomain } from '@hass/common/entity/compute_domain';
import type {
  EntityDiff,
  EntityState as HassEntityState,
} from '@hass/ws/entities';
import type { EntityState } from '@type/room';

const COMPRESSED_STATE = 's';
const COMPRESSED_ATTRIBUTES = 'a';

export function compressedToEntityState(
  entityId: string,
  comp: HassEntityState,
): EntityState {
  let last_changed = new Date(comp.lc * 1000).toISOString();
  return {
    entity_id: entityId,
    state: comp.s,
    attributes: comp.a ?? {},
    domain: computeDomain(entityId),
    last_changed,
    last_updated: comp.lu
      ? new Date(comp.lu * 1000).toISOString()
      : last_changed,
  };
}

export function isMeaningfulChange(diff: EntityDiff): boolean {
  const add = diff['+'];
  const remove = diff['-'];
  return (
    add?.[COMPRESSED_STATE] !== undefined ||
    add?.[COMPRESSED_ATTRIBUTES] !== undefined ||
    (remove?.a?.length !== undefined && remove.a.length > 0)
  );
}

export function applyDiff(
  current: EntityState,
  entityId: string,
  diff: EntityDiff,
): EntityState {
  const add = diff['+'];
  const remove = diff['-'];
  let state = current.state;
  let attributes = { ...current.attributes };

  if (add) {
    if (add.s !== undefined) state = add.s;
    if (add.lc) {
      current.last_updated = current.last_changed = new Date(
        add.lc * 1000,
      ).toISOString();
    } else if (add.lu) {
      current.last_updated = new Date(add.lu * 1000).toISOString();
    }
    if (add.a) Object.assign(attributes, add.a);
  }
  if (remove?.a) {
    for (const key of remove.a) delete attributes[key];
  }

  return {
    entity_id: entityId,
    state,
    attributes,
    domain: computeDomain(entityId),
    last_changed: current.last_changed,
    last_updated: current.last_updated,
  };
}
