import * as equal from 'fast-deep-equal';
import { CSSResult, LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

import { version } from '../package.json';
import {
  createStateIcon,
  getArea,
  getDevice,
  getEntity,
  getState,
} from './helpers';
import { createStateStyles, styles } from './styles';
import type {
  Config,
  EntityConfig,
  EntityInformation,
  HomeAssistant,
} from './types';

export class RoomSummaryCard extends LitElement {
  @state()
  private _config!: Config;

  @state()
  private _states!: EntityInformation[];

  // not state
  private _hass!: HomeAssistant;

  constructor() {
    super();

    this._states = [];

    console.info(
      `%c🐱 Poat's Tools: room-summary-card - ${version}`,
      'color: #CFC493;',
    );
  }

  override render() {
    if (!this._states.length) {
      return html``;
    }

    const roomEntityId = `light.${this._config.area}_light`;
    const roomEntity = {
      config: {
        entity_id: roomEntityId,
        tap_action: {
          action: 'navigate',
          navigation_path: this._config.area.replace('_', '-'),
        },
      } as EntityConfig,
      state: getState(this._hass, roomEntityId),
    } as EntityInformation;

    const icon = getArea(this._hass, this._config.area).icon;

    const { cardStyle, textStyle } = createStateStyles(roomEntity.state);

    return html`
      <div class="card" style=${cardStyle}>
        <div class="grid">
          <div class="name text" style=${textStyle}>
            ${this._config.area
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')}
          </div>
          <div class="label text" style=${textStyle}>
            ${this._getLabel()} <br />
            <span class="stats">${this._getAreaStatistics()}</span>
          </div>
          ${createStateIcon(this, this._hass, roomEntity, ['room'], icon)}
          ${this._states.map((s, i) => {
            return createStateIcon(this, this._hass, s, [
              'entity',
              `entity-${i + 1}`,
            ]);
          })}
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
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const baseEntities = [
      `light.${this._config.area}_light`,
      `switch.${this._config.area}_fan`,
    ];

    const states = baseEntities.map((entity) => {
      return {
        config: {
          entity_id: entity,
          tap_action: { action: 'toggle' },
        } as EntityConfig,
        state: getState(hass, entity),
      } as EntityInformation;
    });

    if (!equal(states, this._states)) {
      this._states = states;
    }
  }

  private _getLabel(): string {
    if (!this._hass || !this._config.area) return '';

    const climate = `${
      getState(
        this._hass,
        'sensor.' + this._config.area + '_climate_air_temperature',
      ).state
    }°F - ${
      getState(this._hass, 'sensor.' + this._config.area + '_climate_humidity')
        .state
    }%`;

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
