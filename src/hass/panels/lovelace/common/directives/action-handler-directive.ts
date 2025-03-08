/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/directives/action-handler-directive.ts
 */

import type {
  ActionHandlerDetail,
  ActionHandlerOptions,
} from '@hass/data/lovelace/action_handler';
import { noChange } from 'lit';
import type { AttributePart, DirectiveParameters } from 'lit/directive';
import { directive, Directive } from 'lit/directive.js';

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

declare global {
  interface HASSDomEvents {
    action: ActionHandlerDetail;
  }
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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    render(_options?: ActionHandlerOptions) {}
  },
);
