import type { HomeAssistant } from './types';

export const doToggle = (hass: HomeAssistant, entity_id: string) => {
  hass.callService(entity_id.substr(0, entity_id.indexOf('.')), 'toggle', {
    entity_id: entity_id,
  });
};

export const moreInfo = (element: HTMLElement, entity_id: string) => {
  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId: entity_id },
  });

  element.dispatchEvent(event);
};
