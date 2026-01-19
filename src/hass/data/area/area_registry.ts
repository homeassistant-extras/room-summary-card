/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/area/area_registry.ts
 */

import type { RegistryEntry } from '../registry';

export interface AreaRegistryEntry extends RegistryEntry {
  area_id: string;
  humidity_entity_id?: string;
  icon: string | undefined;
  name: string;
  picture: string | null;
  temperature_entity_id?: string;
}
