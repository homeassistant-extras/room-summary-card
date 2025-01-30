import * as equal from 'fast-deep-equal';
import { CSSResult, LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';

import { version } from '../package.json';
import { actionHandler } from './action-handler';
import { handleClickAction } from './handle-action';
import {
  createStateIcon,
  getDevice,
  getEntity,
  getIconEntities,
  getProblemEntities,
  getRoomEntity,
  getState,
} from './helpers';
import { getCardStyles, getEntityIconStyles, styles } from './styles';
import type { Config, EntityInformation, HomeAssistant } from './types';

export class RoomSummaryCard extends LitElement {
  @state()
  private _config!: Config;

  @state()
  private _states!: EntityInformation[];

  @state()
  private _roomEntity!: EntityInformation;

  @state()
  private _problemEntities: string[] = [];

  @state()
  private _problemExists: boolean = false;

  // not state
  private _hass!: HomeAssistant;

  constructor() {
    super();

    console.info(
      `%c🐱 Poat's Tools: room-summary-card - ${version}`,
      'color: #CFC493;',
    );
  }

  override render() {
    if (!this._states) {
      return html``;
    }

    const { textStyle } = getEntityIconStyles(this._roomEntity.state);
    const cardStyle = getCardStyles(
      this._hass,
      this._config,
      this._roomEntity.state,
    );

    return html`
      <div class="card" style="${cardStyle}">
        <div class="grid">
          <div
            class="name text"
            style=${textStyle}
            @action=${handleClickAction(this, this._roomEntity)}
            .actionHandler=${actionHandler(this._roomEntity)}
          >
            ${this._config.area
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')}
          </div>
          <div
            class="label text"
            style=${textStyle}
            @action=${handleClickAction(this, this._roomEntity)}
            .actionHandler=${actionHandler(this._roomEntity)}
          >
            ${this._getLabel()} <br />
            <span class="stats">${this._getAreaStatistics()}</span>
          </div>
          ${createStateIcon(this, this._hass, this._roomEntity, ['room'])}
          ${this._states.map((s, i) => {
            return createStateIcon(this, this._hass, s, [
              'entity',
              `entity-${i + 1}`,
            ]);
          })}
          ${this._problemEntities.length > 0
            ? html`<ha-icon
                .icon=${`mdi:numeric-${this._problemEntities.length}`}
                class="status-entities"
                style="background-color: ${this._problemExists
                  ? 'rgba(var(--color-red), 0.8)'
                  : 'rgba(var(--color-green), 0.6)'}"
              />`
            : nothing}
        </div>
      </div>
    `;
  }

  static override get styles(): CSSResult {
    return styles;
  }

  /*
   * HASS setup
   */

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config: Config) {
    const cardConfig = {
      humidity_sensor: `sensor.${config.area}_climate_humidity`,
      temperature_sensor: `sensor.${config.area}_climate_air_temperature`,
      ...config,
    };
    if (!equal(cardConfig, this._config)) {
      this._config = cardConfig;
    }
  }

  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const states = getIconEntities(hass, this._config);
    const roomEntity = getRoomEntity(hass, this._config);
    const { problemEntities, problemExists } = getProblemEntities(
      hass,
      this._config.area,
    );
    this._problemExists = problemExists;

    if (!equal(roomEntity, this._roomEntity)) {
      this._roomEntity = roomEntity;
    }
    if (!equal(states, this._states)) {
      this._states = states;
    }
    if (!equal(problemEntities, this._problemEntities)) {
      this._problemEntities = problemEntities;
    }
  }

  private _getLabel(): string {
    if (!this._hass || !this._config.area) return '';

    const climate = `${
      getState(this._hass, this._config.temperature_sensor)?.state
    }°F - ${getState(this._hass, this._config.humidity_sensor)?.state}%`;

    return climate;
  }

  private _getAreaStatistics(): string {
    if (!this._hass || !this._config.area) return '';

    const d = Object.keys(this._hass.devices).filter(
      (k) => getDevice(this._hass, k).area_id === this._config.area,
    );
    const e = Object.keys(this._hass.entities).filter((k) => {
      const e = getEntity(this._hass, k);
      return e.area_id === this._config.area || d.includes(e.device_id);
    });
    const counts = [
      [d.length, 'devices'],
      [e.length, 'entities'],
    ]
      .filter((count) => count.length > 0)
      .map(([count, type]) => `${count} ${type}`)
      .join(' ');

    return counts;
  }
}
