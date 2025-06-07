/**
 * https://github.com/home-assistant/frontend/blob/dev/src/types.ts
 */

import type { AreaRegistryEntry } from './data/area_registry';
import type { DeviceRegistryEntry } from './data/device_registry';
import type { EntityRegistryDisplayEntry } from './data/entity_registry';
import type { Themes } from './data/ws-themes';
import type { HassEntities, HassEntity, MessageBase } from './ws/types';

export interface HomeAssistant {
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  themes: Themes;
  callWS<T>(msg: MessageBase): Promise<T>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
}
