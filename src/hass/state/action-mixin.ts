/**
 * https://github.com/home-assistant/frontend/blob/dev/src/state/action-mixin.ts
 */

import type { ActionConfigParams } from '@hass/panels/lovelace/common/handle-action';

declare global {
  // for fire event
  interface HASSDomEvents {
    'hass-action': { config: ActionConfigParams; action: string };
  }
}
