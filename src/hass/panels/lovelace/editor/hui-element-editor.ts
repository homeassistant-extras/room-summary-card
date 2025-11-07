/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts
 */

import type { ActionConfig } from '@hass/data/lovelace/config/action';

export type UiAction = Exclude<ActionConfig['action'], 'fire-dom-event'>;

export interface ConfigChangedEvent<T extends object = object> {
  config: T;
  error?: string;
  guiModeAvailable?: boolean;
}

declare global {
  interface HASSDomEvents {
    'config-changed': ConfigChangedEvent;
  }
}
