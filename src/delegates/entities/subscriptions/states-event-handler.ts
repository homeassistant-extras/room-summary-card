/**
 * Handles subscribe_entities WebSocket events (add, remove, change).
 */

import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type {
  EntityDiff,
  EntityState as HassEntityState,
  StatesUpdates,
} from '@hass/ws/entities';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { d } from '@util/debug';
import {
  applyDiff,
  compressedToEntityState,
  isMeaningfulChange,
} from '../subscribe-entities';

export type Listener = (state: EntityState | undefined) => void;

/** Processes ev.a (add), ev.r (remove), ev.c (change) from subscribe_entities; updates state map and notifies listeners. */
export class StatesEventHandler {
  constructor(
    private readonly _listeners: Map<string, Set<Listener>>,
    private readonly _state: Map<string, EntityState>,
    private readonly _hass: HomeAssistant,
  ) {}

  /** Process one WebSocket event; only notifies entities we're subscribed to. */
  handle(ev: StatesUpdates, config?: Config): void {
    d(config, 'entity-subscription-manager', 'handleEvent', 'ev', ev);
    if (ev.a) this._handleAdd(ev.a);
    if (ev.r) this._handleRemove(ev.r);
    if (ev.c) this._handleChange(ev.c, config);
  }

  private _handleAdd(added: Record<string, HassEntityState>): void {
    for (const [entityId, comp] of Object.entries(added)) {
      if (!this._listeners.has(entityId)) continue;
      const state = compressedToEntityState(entityId, comp);
      this._state.set(entityId, state);
      this._notify(entityId, state);
    }
  }

  private _handleRemove(removed: string[]): void {
    for (const entityId of removed) {
      if (!this._listeners.has(entityId)) continue;
      this._state.delete(entityId);
      this._notify(entityId, undefined);
    }
  }

  private _handleChange(
    changes: Record<string, EntityDiff>,
    config?: Config,
  ): void {
    d(
      config,
      'entity-subscription-manager',
      'handleEvent',
      'change',
      Object.keys(changes),
    );
    for (const [entityId, diff] of Object.entries(changes)) {
      if (!this._listeners.has(entityId)) continue;
      if (!isMeaningfulChange(diff)) continue;
      const base =
        this._state.get(entityId) ?? getState(this._hass.states, entityId);
      if (!base) continue;
      const state = applyDiff(base, entityId, diff);
      this._state.set(entityId, state);
      this._notify(entityId, state);
    }
  }

  private _notify(entityId: string, state: EntityState | undefined): void {
    const set = this._listeners.get(entityId);
    if (!set) return;
    for (const fn of set) {
      fn(state);
    }
  }
}
