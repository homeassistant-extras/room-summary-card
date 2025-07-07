/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/entity_registry.ts
 */

import type { RegistryEntry } from './registry';

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  device_id: string;
  area_id: string;
  labels: string[];
  platform?: string;
}

export interface EntityRegistryEntry extends RegistryEntry {
  id: string;
  entity_id: string;
  name: string | null;
  device_id: string | null;
  original_name?: string;
}
