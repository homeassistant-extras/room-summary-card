import { noChange } from 'lit';
import {
  type AttributePart,
  Directive,
  type DirectiveParameters,
  directive,
} from 'lit/directive';

import type {
  ActionHandlerElement,
  ActionHandlerOptions,
  ActionHandlerType,
  EntityInformation,
} from './types';

const getActionHandler = (): ActionHandlerType => {
  const body = document.body;
  if (body.querySelector('action-handler')) {
    return body.querySelector('action-handler') as ActionHandlerType;
  }

  const actionhandler = document.createElement('action-handler');
  body.appendChild(actionhandler);

  return actionhandler as ActionHandlerType;
};

const actionHandlerBind = (
  element: ActionHandlerElement,
  options?: ActionHandlerOptions,
) => {
  const actionhandler: ActionHandlerType = getActionHandler();
  if (!actionhandler) {
    return;
  }
  actionhandler.bind(element, options);
};

const _actionHandler = directive(
  class extends Directive {
    override update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }

    render(_options?: ActionHandlerOptions) {}
  },
);

export const actionHandler = (entity: EntityInformation) =>
  _actionHandler({
    hasDoubleClick: entity.config!.double_tap_action!.action !== 'none',
    hasHold: entity.config!.hold_action!.action !== 'none',
  });
