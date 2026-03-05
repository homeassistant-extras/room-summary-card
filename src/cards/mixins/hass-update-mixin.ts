import type { HomeAssistant } from '@hass/types';
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
}

export type Constructor<T = {}> = new (...args: any[]) => T;

export const HassUpdateMixin = <T extends Constructor<LitElement>>(
  superClass: T,
) => {
  class HassUpdateClass extends superClass implements HassUpdateElement {
    private __hassValue?: HomeAssistant;

    get hass(): HomeAssistant {
      return this.__hassValue!;
    }

    set hass(value: HomeAssistant) {
      this.__hassValue = value;
    }

    private readonly _boundHassUpdateHandler =
      this._handleHassUpdate.bind(this);

    override connectedCallback(): void {
      super.connectedCallback();
      globalThis.addEventListener('hass-update', this._boundHassUpdateHandler);
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      globalThis.removeEventListener(
        'hass-update',
        this._boundHassUpdateHandler,
      );
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
