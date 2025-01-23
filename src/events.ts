import type { HomeAssistant } from './types';

export const doToggle = (hass: HomeAssistant, entity_id: string) => {
  hass.callService(entity_id.substr(0, entity_id.indexOf('.')), 'toggle', {
    entity_id: entity_id,
  });
};
