/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/entity/compute_domain.ts
 */

export const computeDomain = (entityId: string): string =>
  entityId.substring(0, entityId.indexOf('.'));
