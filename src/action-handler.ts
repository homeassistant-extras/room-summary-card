import { noChange } from 'lit';
import {
  type AttributePart,
  Directive,
  type DirectiveParameters,
  directive,
} from 'lit/directive';

interface ActionHandlerType extends HTMLElement {
  holdTime: number;
  bind(element: Element, options?: ActionHandlerOptions): void;
}

interface ActionHandlerElement extends HTMLElement {
  actionHandler?: {
    options: ActionHandlerOptions;
    start?: (ev: Event) => void;
    end?: (ev: Event) => void;
    handleKeyDown?: (ev: KeyboardEvent) => void;
  };
}

const getActionHandler = (): ActionHandlerType => {
  const body = document.body;
  if (body.querySelector('action-handler')) {
    return body.querySelector('action-handler') as ActionHandlerType;
  }

  const actionhandler = document.createElement('action-handler');
  body.appendChild(actionhandler);

  return actionhandler as ActionHandlerType;
};

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

export const actionHandlerBind = (
  element: ActionHandlerElement,
  options?: ActionHandlerOptions,
) => {
  const actionhandler: ActionHandlerType = getActionHandler();
  if (!actionhandler) {
    return;
  }
  actionhandler.bind(element, options);
};

export const actionHandler = directive(
  class extends Directive {
    override update(part: AttributePart, [options]: DirectiveParameters<this>) {
      actionHandlerBind(part.element as ActionHandlerElement, options);
      return noChange;
    }

    render(_options?: ActionHandlerOptions) {}
  },
);
