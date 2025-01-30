import type {
  ActionConfigParams,
  ActionHandlerEvent,
  EntityInformation,
} from './types';

export const handleClickAction = (
  element: HTMLElement,
  entity: EntityInformation,
): unknown => {
  return {
    handleEvent: (ev: ActionHandlerEvent) => {
      const action = ev.detail?.action;
      if (!action) return;

      const config: ActionConfigParams = {
        entity: entity.config.entity_id,
        ...entity.config,
      };
      const event = new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: { config, action },
      });

      element.dispatchEvent(event);
    },
  };
};
