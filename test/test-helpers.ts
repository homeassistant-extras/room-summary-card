import type { HassEntity } from '@hass/ws/types';
import type { EntityState } from '@type/room';

/**
 * Creats a fake entity
 * @param domain
 * @param name
 * @param state
 * @param attributes
 * @returns
 */
export const createState = (
  domain: string,
  name: string,
  state: string = 'on',
  attributes = {},
): HassEntity => {
  return {
    entity_id: `${domain}.${name}`,
    state: state,
    attributes: attributes,
    last_changed: '0',
    last_updated: '0',
  };
};

/**
 * Creats a fake state entity
 * @param domain
 * @param name
 * @param state
 * @param attributes
 * @returns
 */
export const createStateEntity = (
  domain: string,
  name: string,
  state: string = 'on',
  attributes = {},
): EntityState => {
  return {
    entity_id: `${domain}.${name}`,
    state: state,
    attributes: attributes,
    domain,
    last_changed: '0',
    last_updated: '0',
  };
};

/** Build {@link EntityState} from a full `entity_id` (e.g. `sensor.foo_bar`). */
export const createStateEntityForEntityId = (
  entityId: string,
  state: string,
  attributes: Record<string, any> = {},
): EntityState => {
  const dot = entityId.indexOf('.');
  if (dot === -1) {
    return {
      entity_id: entityId,
      state,
      attributes,
      domain: entityId,
      last_changed: '0',
      last_updated: '0',
    };
  }
  const domain = entityId.slice(0, dot);
  const name = entityId.slice(dot + 1);
  return createStateEntity(domain, name, state, attributes);
};
