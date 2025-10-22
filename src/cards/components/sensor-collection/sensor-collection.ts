import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { hasFeature } from '@config/feature';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { getIconResources } from '@delegates/retrievers/icons';
import { sensorDataToDisplaySensors } from '@delegates/utils/sensor-utils';
import {
  FALLBACK_DOMAIN_ICONS,
  type CategoryType,
  type IconResources,
} from '@hass/data/icon';
import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';
import type { AveragedSensor, SensorData } from '@type/sensor';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { styles } from './styles';

/**
 * Sensor Collection Component
 *
 * A custom Lit element that renders a collection of sensors including both
 * individual sensors (specified in config.sensors) and averaged sensors
 * (calculated from config.sensor_classes). The component handles:
 *
 * - Individual sensors display with their specific state values
 * - Averaged sensors with computed averages across device classes
 * - Icon rendering with fallback support for multi-averaged sensors
 * - Feature-based configuration for hiding climate labels and sensor icons
 * - Proper state display delegation to the stateDisplay utility
 *
 * @version See package.json
 */
export class SensorCollection extends HassUpdateMixin(LitElement) {
  /**
   * Home Assistant instance
   */
  private _hass!: HomeAssistant;

  /**
   * Card configuration object containing feature flags and sensor settings
   */
  @property({ type: Object }) config!: Config;

  /**
   * Sensor data containing both individual sensors and averaged sensor groups
   */
  @property({ type: Object }) sensors!: SensorData;

  /**
   * Flags for various states
   */
  @property({ type: Boolean, reflect: true })
  private hide!: boolean;
  @property({ type: String, reflect: true })
  private layout!: string;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  // @ts-ignore
  override set hass(hass: HomeAssistant) {
    d(this.config, 'sensor-collection', 'set hass');
    this._hass = hass;
    this.hide = hasFeature(this.config, 'hide_sensor_icons');
    this.layout = this.config.sensor_layout ?? 'default';
  }

  public override render(): TemplateResult | typeof nothing {
    d(this.config, 'sensor-collection', 'render');
    d(this.config, 'sensor-collection', 'config', this.config);
    d(this.config, 'sensor-collection', 'sensors', this.sensors);
    if (!this._hass || hasFeature(this.config, 'hide_climate_label')) {
      return nothing;
    }

    return html`
      ${stylesToHostCss(this.config.styles?.sensors)}
      ${this.sensors.averaged.map((sensor) => this.renderSensor(sensor, true))}
      ${this.sensors.individual.map((sensor) =>
        this.renderSensor(sensor, false),
      )}
    `;
  }

  private renderSensor(
    sensor: EntityState | AveragedSensor,
    isAveraged: boolean,
  ): TemplateResult {
    if (isAveraged) {
      const s = sensor as AveragedSensor;
      const isMultiple = s.states.length > 1;

      if (isMultiple) {
        return html`
          <div class="sensor">
            ${this.renderMultiIcon(s)} ${sensorDataToDisplaySensors(s)}
          </div>
        `;
      }

      // Use the first state from averaged sensor
      const state = s.states[0]!;
      return this.renderSingleSensor(state);
    }

    // Use the sensor directly as EntityState
    return this.renderSingleSensor(sensor as EntityState);
  }

  private renderSingleSensor(state: EntityState): TemplateResult {
    const info: EntityInformation = {
      config: {
        entity_id: state.entity_id,
        tap_action: {
          action: 'more-info',
        },
      },
      state: state,
    };

    return html`
      <div
        class="sensor"
        @action=${handleClickAction(this, info)}
        .actionHandler=${actionHandler(info)}
      >
        ${this.renderStateIcon(state)} ${stateDisplay(this._hass, state)}
      </div>
    `;
  }

  private renderMultiIcon(
    sensor: SensorData['averaged'][0],
  ): TemplateResult | typeof nothing {
    if (this.hide) return nothing;

    const iconPromise = getIconResources(this._hass).then(
      (icons: IconResources<CategoryType['entity_component']>) => {
        const icon =
          icons.resources?.[sensor.domain]?.[sensor.device_class]?.default;

        if (icon) return html`<ha-icon .icon=${icon}></ha-icon>`;

        const fallback =
          FALLBACK_DOMAIN_ICONS[
            sensor.domain as keyof typeof FALLBACK_DOMAIN_ICONS
          ];
        return fallback ? html`<ha-icon .icon=${fallback}></ha-icon>` : nothing;
      },
    );

    return html`${until(iconPromise)}`;
  }

  private renderStateIcon(state?: any): TemplateResult | typeof nothing {
    if (this.hide || !state) return nothing;
    return html`<ha-state-icon
      .hass=${this._hass}
      .stateObj=${state}
    ></ha-state-icon>`;
  }
}
