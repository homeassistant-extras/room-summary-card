import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { fireEvent } from './common/fire-event';
import type { Config } from './types/config';
import type { HaFormSchema } from './types/ha-form';
import type { HomeAssistant } from './types/homeassistant';

const SCHEMA: HaFormSchema[] = [
  { name: 'area', label: 'Area', selector: { area: {} } },
  {
    name: 'features',
    label: 'Features',
    selector: {
      select: {
        multiple: true,
        mode: 'list',
        options: [{ label: 'Hide Climate Label', value: 'hide_climate_label' }],
      },
    },
  },
];

export class RoomSummaryCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * Renders the room summary card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s: HaFormSchema) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  /**
   * Sets up the card configuration
   * @param {EditorConfig} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;
    if (!config.features?.length) {
      delete config.features;
    }

    fireEvent(this, 'config-changed', {
      config: ev.detail.value as Config,
    });
  }
}
