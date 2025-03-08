/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/handle-action.ts
 */

import type { ActionConfig } from '@hass/data/lovelace/config/action';

export interface ActionConfigParams {
  entity?: string;
  camera_image?: string;
  image_entity?: string;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
