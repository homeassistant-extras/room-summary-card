/**
 * https://github.com/home-assistant/home-assistant-js-websocket/blob/master/lib/entities.ts

*/

import type { Context } from '@hass/ws/types';

export interface EntityState {
  /** state */
  s: string;
  /** attributes */
  a: { [key: string]: any };
  /** context */
  c: Context | string;
  /** last_changed; if set, also applies to lu */
  lc: number;
  /** last_updated */
  lu: number;
}

interface EntityStateRemove {
  /** attributes */
  a: string[];
}

export interface EntityDiff {
  /** additions */
  '+'?: Partial<EntityState>;
  /** subtractions */
  '-'?: EntityStateRemove;
}

export interface StatesUpdates {
  /** add */
  a?: Record<string, EntityState>;
  /** remove */
  r?: string[]; // remove
  /** change */
  c: Record<string, EntityDiff>;
}
