import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';

const SCHEMA: HaFormSchema[] = [
  { name: 'area', label: 'Area', required: true, selector: { area: {} } },
  {
    name: 'entity',
    label: 'Main room entity',
    required: false,
    selector: { entity: { multiple: false } },
  },
  {
    name: 'entities',
    label: 'Area side entities',
    required: false,
    selector: { entity: { multiple: true } },
  },
  {
    name: 'temperature_sensor',
    label: 'Temperature sensor',
    required: false,
    selector: { entity: { multiple: false, filter: { domain: 'sensor' } } },
  },
  {
    name: 'humidity_sensor',
    label: 'Humidity sensor',
    required: false,
    selector: { entity: { multiple: false, filter: { domain: 'sensor' } } },
  },
  {
    name: 'navigate',
    label: 'Navigate path when card tapped',
    required: false,
    selector: { text: { type: 'url' } },
  },
  {
    name: 'features',
    label: 'Features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list',
        options: [
          {
            label: 'Hide Climate Label',
            value: 'hide_climate_label',
          },
          { label: 'Hide Area Stats', value: 'hide_area_stats' },
          {
            label: 'Exclude Default Entities',
            value: 'exclude_default_entities',
          },
          { label: 'Skip Climate Colors', value: 'skip_climate_colors' },
        ],
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
   * renders the lit element card
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
   * @param {Config} config - The card configuration
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
      config,
    });
  }
}
