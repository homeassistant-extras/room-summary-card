import type { HomeAssistant, State } from './types';

export const doToggle = (hass: HomeAssistant, entity: State) => {
  hass.callService(entity.getDomain(), 'toggle', {
    entity_id: entity.entity_id,
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
