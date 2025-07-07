/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_state_name.ts
 */

import type { HassEntity } from '@hass/ws/types';
import { computeObjectId } from './compute_object_id';

export const computeStateNameFromEntityAttributes = (
  entityId: string,
  attributes: Record<string, any>,
): string =>
  attributes.friendly_name === undefined
    ? computeObjectId(entityId).replace(/_/g, ' ')
    : (attributes.friendly_name ?? '').toString();

export const computeStateName = (stateObj: HassEntity): string =>
  computeStateNameFromEntityAttributes(stateObj.entity_id, stateObj.attributes);
