import type { HomeAssistant } from '@hass/types';
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

export type Constructor<T = {}> = new (...args: any[]) => T;

export const HassUpdateMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class HassUpdateClass extends superClass implements HassUpdateElement {
    private __hassValue?: HomeAssistant;
    private __configValue?: Config;

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

      // Listen on the component's root node (shadow root of the parent card)
      // instead of globalThis. This scopes events so that each card's
      // hass-update only reaches its own children, not components in other
      // cards on the same dashboard.
      const root =
        typeof this.getRootNode === 'function'
          ? this.getRootNode()
          : undefined;
      if (root && root !== this) {
        root.addEventListener(
          'hass-update',
          this._boundHassUpdateHandler as EventListener,
        );
      } else {
        // Fallback for components not in a shadow root
        globalThis.addEventListener(
          'hass-update',
          this._boundHassUpdateHandler,
        );
      }
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      const root =
        typeof this.getRootNode === 'function'
          ? this.getRootNode()
          : undefined;
      if (root && root !== this) {
        root.removeEventListener(
          'hass-update',
          this._boundHassUpdateHandler as EventListener,
        );
      } else {
        globalThis.removeEventListener(
          'hass-update',
          this._boundHassUpdateHandler,
        );
      }
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
