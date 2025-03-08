/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/lovelace/action_handler.ts
 */

import type { HASSDomEvent } from '../../common/dom/fire_event.ts';

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

export interface ActionHandlerDetail {
  action: 'hold' | 'tap' | 'double_tap';
}

export type ActionHandlerEvent = HASSDomEvent<ActionHandlerDetail>;
