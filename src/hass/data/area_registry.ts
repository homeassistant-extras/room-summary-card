/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/area_registry.ts
 */

import type { RegistryEntry } from './registry';

export interface AreaRegistryEntry extends RegistryEntry {
  area_id: string;
  icon: string | null;
}
