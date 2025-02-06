import type { State } from '../src/types/homeassistant';

export const createStateEntity = (
  domain: string,
  name: string,
  state: string = 'on',
  attributes = {},
): State => {
  return {
    entity_id: `${domain}.${name}`,
    state: state,
    attributes: attributes,
    getDomain() {
      return domain;
    },
    isActive() {
      return state === 'on';
    },
  };
};
