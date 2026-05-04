/**
 * Per-connection singleton that consolidates entity subscriptions.
 * Multiple badges across cards share one subscribe_entities call.
 *
 * @see https://developers.home-assistant.io/docs/api/websocket#subscribe_entities
 */

import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { StatesUpdates } from '@hass/ws/entities';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { d } from '@util/debug';
import { ResubscribeScheduler } from './resubscribe-scheduler';
import type { Listener } from './states-event-handler';
import { StatesEventHandler } from './states-event-handler';

type Connection = HomeAssistant['connection'];

const managers = new Map<Connection, EntitySubscriptionManager>();

export function getEntitySubscriptionManager(
  hass: HomeAssistant,
  config?: Config,
): EntitySubscriptionManager {
  const conn = hass.connection;
  let manager = managers.get(conn);
  if (!manager) {
    d(config, 'entity-subscription-manager', 'initial creation');
    manager = new EntitySubscriptionManager(hass);
    managers.set(conn, manager);
  }
  return manager;
}

/** One manager per connection; tracks listeners per entity and maintains a single subscribe_entities call. */
export class EntitySubscriptionManager {
  private readonly _hass: HomeAssistant;
  private readonly _listeners = new Map<string, Set<Listener>>();
  private readonly _state = new Map<string, EntityState>();
  private readonly _scheduler = new ResubscribeScheduler();
  private readonly _eventHandler: StatesEventHandler;
  private _unsubscribe?: () => void;
  private _resubscribeVersion = 0;

  constructor(hass: HomeAssistant) {
    this._hass = hass;
    this._eventHandler = new StatesEventHandler(
      this._listeners,
      this._state,
      this._hass,
    );
  }

  /** Subscribe to entity; returns unsubscribe fn. Batches resubscribe when entity set changes. */
  subscribe(entityId: string, onChange: Listener, config?: Config): () => void {
    let set = this._listeners.get(entityId);
    if (!set) {
      set = new Set();
      this._listeners.set(entityId, set);
    }
    set.add(onChange);

    const entityWasNew = set.size === 1;

    if (entityWasNew) {
      this._scheduleResubscribe(config);
    }

    d(
      config,
      'entity-subscription-manager',
      'subscribe',
      entityId,
      'listeners',
      set.size,
    );

    this._deliverInitialState(entityId, onChange);

    return () => {
      const s = this._listeners.get(entityId);
      if (!s) return;
      s.delete(onChange);
      if (s.size === 0) {
        this._listeners.delete(entityId);
        this._state.delete(entityId);
        this._scheduleResubscribe(config);
      }
    };
  }

  private _scheduleResubscribe(config?: Config): void {
    this._scheduler.schedule(() => this._resubscribe(config));
  }

  private _resubscribe(config?: Config): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = undefined;
    }

    const entityIds = [...this._listeners.keys()];
    if (entityIds.length === 0) {
      return;
    }

    d(
      config,
      'entity-subscription-manager',
      'subscribe_entities',
      entityIds,
      "\nThis shouldn't happen alot.. 🤔",
    );
    const version = ++this._resubscribeVersion;
    void this._hass.connection
      .subscribeMessage((ev: StatesUpdates) => this._handleEvent(ev, config), {
        type: 'subscribe_entities',
        entity_ids: entityIds,
      })
      .then((unsub) => {
        if (version !== this._resubscribeVersion) {
          d(
            config,
            'entity-subscription-manager',
            'resubscribe',
            'stale',
            version,
            this._resubscribeVersion,
          );
          unsub();
          return;
        }
        d(config, 'entity-subscription-manager', 'resubscribe', 'active');
        this._unsubscribe = unsub;
      });
  }

  private _handleEvent(ev: StatesUpdates, config?: Config): void {
    this._eventHandler.handle(ev, config);
  }

  /**
   * Push current known state to a listener immediately. Required when multiple
   * components subscribe to the same entity: only the first subscription
   * triggers subscribe_entities; later listeners would otherwise stay empty
   * until the next websocket change.
   */
  private _deliverInitialState(entityId: string, onChange: Listener): void {
    let state = this._state.get(entityId);
    if (!state) {
      state = getState(this._hass.states, entityId);
      if (state) {
        this._state.set(entityId, state);
      }
    }
    onChange(state);
  }
}
