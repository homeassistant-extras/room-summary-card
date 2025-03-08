import { fireEvent } from '@hass/common/dom/fire_event';
import type { ActionHandlerEvent } from '@hass/data/lovelace/action_handler';
import { actionHandler as hassActionHandler } from '@hass/panels/lovelace/common/directives/action-handler-directive';
import type { ActionConfigParams } from '@hass/panels/lovelace/common/handle-action';
import type { EntityInformation } from '@type/config';

/**
 * Creates an action handler for an entity with specified configuration.
 * This is the main export that should be used by consumers of this module.
 *
 * @param {EntityInformation} entity - The entity to create an action handler for
 * @returns {Directive} A directive configured with the entity's action options
 */
export const actionHandler = (entity: EntityInformation) => {
  return hassActionHandler({
    hasDoubleClick: entity.config?.double_tap_action?.action !== 'none',
    hasHold: entity.config?.hold_action?.action !== 'none',
  });
};

/**
 * Creates a click action handler for a given element and entity.
 * The handler processes click events and dispatches them as Home Assistant actions.
 *
 * @param {HTMLElement} element - The DOM element that will receive the action
 * @param {EntityInformation} entity - The entity information containing configuration and state
 * @returns {Object} An object with a handleEvent method that processes actions
 *
 * @example
 * ```typescript
 * // Usage in a component
 * const element = document.querySelector('.my-element');
 * const entityInfo = { config: { entity_id: 'light.living_room', ... } };
 * element.addEventListener('click', handleClickAction(element, entityInfo));
 * ```
 */
export const handleClickAction = (
  element: HTMLElement,
  entity: EntityInformation,
): { handleEvent: (ev: ActionHandlerEvent) => void } => {
  return {
    /**
     * Handles an action event by creating and dispatching a 'hass-action' custom event.
     *
     * @param {ActionHandlerEvent} ev - The action handler event to process
     */
    handleEvent: (ev: ActionHandlerEvent): void => {
      // Extract action from event detail
      const action = ev.detail?.action;
      if (!action) return;

      // Create configuration object for the action
      const config: ActionConfigParams = {
        entity: entity.config.entity_id,
        ...entity.config,
      };

      // @ts-ignore
      fireEvent(element, 'hass-action', {
        config,
        action,
      });
    },
  };
};
