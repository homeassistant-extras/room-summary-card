/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/entity_registry.ts
 */

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  area_id: string;
  device_id: string;
  labels: string[];
}
