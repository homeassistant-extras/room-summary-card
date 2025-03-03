import type { EntityState } from '@type/config';
import type { State } from '@type/homeassistant';

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
): State => {
  return {
    entity_id: `${domain}.${name}`,
    state: state,
    attributes: attributes,
    //domain,
    //isActive: state === 'on',
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
    isActive: state === 'on',
  };
};
