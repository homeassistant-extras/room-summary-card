/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts
 */

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
