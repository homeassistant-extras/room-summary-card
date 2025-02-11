/**
 * Action Handler Directive Module
 *
 * This module implements a custom directive for handling actions in web components
 * using the Lit library. It manages action handlers for elements, supporting
 * features like double-click and hold actions.
 *
 * Implements custom click action handling for Home Assistant entities.
 * This module creates a handler that processes click events and dispatches
 * them as Home Assistant actions with the appropriate configuration.
 */

import { noChange } from 'lit';
import {
  type AttributePart,
  Directive,
  type DirectiveParameters,
  directive,
} from 'lit/directive.js';

import type {
  ActionHandlerElement,
  ActionHandlerEvent,
  ActionHandlerOptions,
  ActionHandlerType,
} from '../types';
import type { ActionConfigParams } from '../types/action';
import type { EntityInformation } from '../types/config';
import { fireEvent } from './fire-event';

/**
 * Retrieves or creates the global action handler element.
 * The action handler is singleton element attached to the document body.
 *
 * @returns {ActionHandlerType} The action handler element
 */
const getActionHandler = (): ActionHandlerType => {
  const body = document.body;
  const existingHandler = body.querySelector('action-handler');

  if (existingHandler) {
    return existingHandler as ActionHandlerType;
  }

  const actionHandler = document.createElement('action-handler');
  body.appendChild(actionHandler);

  return actionHandler as ActionHandlerType;
};

/**
 * Binds an element to the action handler with specified options.
 *
 * @param {ActionHandlerElement} element - The element to bind actions to
 * @param {ActionHandlerOptions} [options] - Configuration options for the action handler
 */
const actionHandlerBind = (
  element: ActionHandlerElement,
  options?: ActionHandlerOptions,
): void => {
  const actionHandler: ActionHandlerType = getActionHandler();
  if (!actionHandler) {
    return;
  }
  actionHandler.bind(element, options);
};

/**
 * Creates a custom directive for handling actions.
 * This directive manages the lifecycle of action handling for elements.
 */
const _actionHandler = directive(
  class extends Directive {
    /**
     * Updates the directive when properties change.
     *
     * @param {AttributePart} part - The attribute part being updated
     * @param {DirectiveParameters<this>} [options] - The options for the action handler
     * @returns {Symbol} A symbol indicating no change is needed in the rendering
     */
    override update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }

    /**
     * Renders the directive.
     * This is intentionally empty as the directive only handles actions.
     *
     * @param {ActionHandlerOptions} [_options] - Options for the action handler
     */
    render(_options?: ActionHandlerOptions) {}
  },
);

/**
 * Creates an action handler for an entity with specified configuration.
 * This is the main export that should be used by consumers of this module.
 *
 * @param {EntityInformation} entity - The entity to create an action handler for
 * @returns {Directive} A directive configured with the entity's action options
 */
export const actionHandler = (entity: EntityInformation) => {
  return _actionHandler({
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

      fireEvent(element, 'hass-action', {
        config,
        action,
      });
    },
  };
};
