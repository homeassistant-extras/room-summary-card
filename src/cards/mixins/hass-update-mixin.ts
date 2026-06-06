import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Config } from '@type/config';
import type { LitElement } from 'lit';

export interface HassUpdateEvent {
  /**
   * The Home Assistant instance.
   */
  hass: HomeAssistant;
}

export interface HassUpdateElement {
  /**
   * The Home Assistant instance.
   */
  hass?: HomeAssistant;

  /**
   * The card config.
   */
  config?: Config;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mixin constructor
export type Constructor<T = object> = new (...args: any[]) => T;

export const HassUpdateMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class HassUpdateClass extends superClass implements HassUpdateElement {
    private __hassValue?: HomeAssistant;
    private __configValue?: Config;
    private _listenerTarget?: EventTarget;

    /**
     * Optional escape hatch for portalled descendants (e.g. `problem-dialog`,
     * which HA's dialog manager moves out of the card's shadow tree). When
     * set, the mixin listens on `_host.shadowRoot` instead of `getRootNode()`,
     * routing events back to the original card.
     */
    _host?: Element;

    get hass(): HomeAssistant {
      return this.__hassValue!;
    }

    set hass(value: HomeAssistant) {
      this.__hassValue = value;
    }

    get config(): Config {
      return this.__configValue!;
    }

    set config(value: Config) {
      this.__configValue = value;
    }

    private readonly _boundHassUpdateHandler =
      this._handleHassUpdate.bind(this);

    override connectedCallback(): void {
      super.connectedCallback();
      this._bindHassUpdateListener();
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this._unbindHassUpdateListener();
    }

    /**
     * Attaches the listener to the closest scope: an explicit `_host`'s
     * shadow root if set (for portalled descendants), otherwise the
     * component's own root node (the parent shadow tree). Each card has a
     * distinct shadow root, so this naturally isolates events per card.
     *
     * Exposed so portalled descendants can re-bind after `_host` is supplied,
     * since their `connectedCallback` runs before the property is set.
     */
    protected _bindHassUpdateListener(): void {
      if (this._listenerTarget) return;
      const target = this._resolveListenerTarget();
      if (target) {
        this._listenerTarget = target;
        target.addEventListener('hass-update', this._boundHassUpdateHandler);
      }
    }

    protected _unbindHassUpdateListener(): void {
      if (this._listenerTarget) {
        this._listenerTarget.removeEventListener(
          'hass-update',
          this._boundHassUpdateHandler,
        );
        this._listenerTarget = undefined;
      }
    }

    private _resolveListenerTarget(): EventTarget | undefined {
      if (this._host?.shadowRoot) {
        return this._host.shadowRoot;
      }
      const getRootNode = (this as unknown as { getRootNode?: () => unknown })
        .getRootNode;
      if (typeof getRootNode !== 'function') return undefined;
      const root = getRootNode.call(this) as EventTarget;
      return root && root !== (this as unknown as EventTarget)
        ? root
        : undefined;
    }

    private _handleHassUpdate(event: Event): void {
      const {
        detail: { hass },
      } = event as CustomEvent<HassUpdateEvent>;
      this.hass = hass;
    }
  }

  return HassUpdateClass;
};
