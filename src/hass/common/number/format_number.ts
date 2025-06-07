/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/number/format_number.ts
 */

import type { HassEntity, HassEntityAttributeBase } from '@hass/ws/types';

/**
 * Returns true if the entity is considered numeric based on the attributes it has
 * @param stateObj The entity state object
 */
export const isNumericState = (stateObj: HassEntity): boolean =>
  isNumericFromAttributes(stateObj.attributes);

export const isNumericFromAttributes = (
  attributes: HassEntityAttributeBase,
  numericDeviceClasses?: string[],
): boolean =>
  !!attributes.unit_of_measurement ||
  !!attributes.state_class ||
  (numericDeviceClasses || []).includes(attributes.device_class ?? '');
