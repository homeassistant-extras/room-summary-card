import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HassEntityAttributeBase, HassEntityBase } from '@hass/ws/types';

interface GroupEntityAttributes extends HassEntityAttributeBase {
  entity_id: string[];
  order: number;
  auto?: boolean;
  view?: boolean;
  control?: 'hidden';
}

export interface GroupEntity extends HassEntityBase {
  attributes: GroupEntityAttributes;
}

export const computeGroupDomain = (
  stateObj: GroupEntity,
): string | undefined => {
  const entityIds = stateObj.attributes.entity_id || [];
  const uniqueDomains = [
    ...new Set(entityIds.map((entityId) => computeDomain(entityId))),
  ];
  return uniqueDomains.length === 1 ? uniqueDomains[0] : undefined;
};
