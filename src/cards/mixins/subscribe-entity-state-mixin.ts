import { getEntitySubscriptionManager } from '@delegates/entities/subscriptions';
import type { HomeAssistant } from '@hass/types';
import type { SubscriptionUnsubscribe } from '@hass/ws/types';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { d } from '@util/debug';
import type { LitElement } from 'lit';
import { state } from 'lit/decorators.js';

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface SubscribeEntityStateElement {
  /**
   * The Home Assistant instance.
   */
  hass?: HomeAssistant;

  /**
   * The card config.
   */
  config?: Config;
}

/**
 * Mixin that subscribes to entity state changes via subscribe_entities.
 * Only notifies on meaningful changes (state/attributes), not context/last_updated.
 * Set entityId to specify which entity to watch.
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
    protected state: EntityState | undefined;

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
      if (!this._unsubscribe) {
        return;
      }

      d(this.config, 'subscribe-entity-state-mixin', 'unsubscribe');

      this._unsubscribe();
      this._unsubscribe = undefined;
      this._subscribedEntityId = undefined;
    }

    /**
     * Setup the entity subscription.
     */
    private _setupEntitySubscription(): void {
      const id = this.entityId;
      const hass = this.hass;
      const config = this.config;

      d(config, 'subscribe-entity-state-mixin', 'setupEntitySubscription', id);

      if (!id || !hass || !config) {
        d(
          config,
          'subscribe-entity-state-mixin',
          'setupEntitySubscription',
          'missing stuff',
        );
        this._teardownEntitySubscription();
        this.state = undefined;
        return;
      }

      if (this._subscribedEntityId === id) {
        d(
          config,
          'subscribe-entity-state-mixin',
          'setupEntitySubscription',
          'already subscribed.. 😕',
        );
        return;
      }

      this._teardownEntitySubscription();
      this._subscribedEntityId = id;

      const manager = getEntitySubscriptionManager(hass, config);
      this._unsubscribe = manager.subscribe(
        id,
        (state) => {
          this.state = state;
        },
        config,
      );
    }
  }

  return SubscribeEntityStateClass;
};
