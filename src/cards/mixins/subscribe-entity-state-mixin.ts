import { subscribeEntityState } from '@delegates/entities/subscribe-trigger';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { SubscriptionUnsubscribe } from '@hass/ws/types';
import type { EntityState } from '@type/room';
import type { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
const equal = require('fast-deep-equal');

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface SubscribeEntityStateElement {
  hass?: HomeAssistant;
}

/**
 * Mixin that subscribes to entity state changes via subscribe_trigger.
 * Set entityIdToSubscribe to specify which entity to watch.
 * Read _subscribedEntityState for the current state (undefined when not subscribed).
 */
export const SubscribeEntityStateMixin = <
  T extends Constructor<LitElement & SubscribeEntityStateElement>,
>(
  superClass: T,
) => {
  class SubscribeEntityStateClass extends superClass {
    /**
     * The unsubscribe function for the subscription.
     */
    private _unsubscribe?: SubscriptionUnsubscribe;

    /**
     * The entity_id of the subscribed entity.
     */
    private _subscribedEntityId?: string;

    /**
     * The entity_id to subscribe to. Set this property to specify which entity to watch.
     */
    protected entityId?: string;

    /**
     * The current state of the subscribed entity.
     * Updates cause re-render of the component.
     */
    @state()
    protected _subscribedEntityState?: EntityState;

    /**
     * Setup the entity subscription.
     */
    override connectedCallback(): void {
      super.connectedCallback();
      this._setupEntitySubscription();
    }

    /**
     * Teardown the entity subscription.
     */
    override disconnectedCallback(): void {
      this._teardownEntitySubscription();
      super.disconnectedCallback();
    }

    /**
     * Teardown the entity subscription.
     */
    private _teardownEntitySubscription(): void {
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = undefined;
        this._subscribedEntityId = undefined;
      }
    }

    /**
     * Setup the entity subscription.
     */
    private _setupEntitySubscription(): void {
      const id = this.entityId;
      const hass = this.hass;

      if (!id || !hass) {
        this._teardownEntitySubscription();
        this._subscribedEntityState = undefined;
        return;
      }

      if (this._subscribedEntityId === id) {
        return;
      }

      this._teardownEntitySubscription();
      this._subscribedEntityId = id;

      const initialState = getState(hass.states, id);
      this._subscribedEntityState = initialState;

      subscribeEntityState(
        hass,
        id,
        ({ variables: { trigger: { from_state, to_state } = {} } = {} }) => {
          // use getState since it cuts out extra properties like timestamps
          const fromState = getState({ [id]: from_state }, id);
          const toState = getState({ [id]: to_state }, id);
          if (equal(fromState, toState)) return;

          // Update the state if it has changed.
          this._subscribedEntityState = toState;
        },
      ).then((unsubscribe) => {
        this._unsubscribe = unsubscribe;
      });
    }
  }

  return SubscribeEntityStateClass;
};
