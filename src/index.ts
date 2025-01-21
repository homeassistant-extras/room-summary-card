import * as equal from 'fast-deep-equal';
import { CSSResult, LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';

import { version } from '../package.json';
import { createStateIcon } from './helpers';
import { styles } from './styles';
import type { Config, HomeAssistant } from './types';
import type { EntityConfig } from './types';

declare global {
    interface Window {
        customCards: Array<Object>;
    }
}

class RoomSummaryCard extends LitElement {
    @state()
    private _config!: Config;

    // not state
    private _hass!: HomeAssistant;

    constructor() {
        super();

        console.info(
            `%c🐱 Poat's Tools: room-summary-card - ${version}`,
            'color: #CFC493;',
        );
    }

    render() {
        if (!this._hass || !this._config) {
            return html``;
        }

        const mainEntity = this._hass.states[`light.${this._config.area}`];
        const isUnavailable = mainEntity?.state === 'unavailable';

        return html`
            <div class="card">
                <div class="grid">
                    <div class="name text">
                        ${this._config.area
                            .split('_')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')}
                    </div>
                    <div class="label text">
                        ${this._getLabel()} <br />
                        <span class="stats">${this._getAreaStatistics()}</span>
                    </div>
                    ${createStateIcon(this._hass, mainEntity, ['room'])}
                    ${this._renderEntityIcon(this._config.entity_1, 1)}
                    ${this._renderEntityIcon(this._config.entity_2, 2)}
                    ${this._renderEntityIcon(this._config.entity_3, 3)}
                    ${this._renderEntityIcon(this._config.entity_4, 4)}
                </div>
            </div>
        `;
    }

    static get styles(): CSSResult {
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
    }

    private _renderEntityIcon(
        entity: EntityConfig | undefined,
        position: number,
    ) {
        if (!entity) return null;

        const state = this._hass.states[entity.entity_id];
        if (!state) return null;

        return html`
            <div class="icon entity entity-${position}">
                <ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${state}
                    .icon=${state.attributes.icon || 'mdi:help-circle'}
                    id="icon"
                ></ha-state-icon>
            </div>
        `;
    }

    private _getLabel(): string {
        if (!this._hass || !this._config.area) return '';

        const climate = `${
            this._hass.states[
                'sensor.' + this._config.area + '_climate_air_temperature'
            ].state
        }°F - ${
            this._hass.states[
                'sensor.' + this._config.area + '_climate_humidity'
            ].state
        }%`;

        return climate;
    }

    private _getAreaStatistics(): string {
        if (!this._hass || !this._config.area) return '';

        const d = Object.keys(this._hass.devices).filter(
            (k) => this._hass.devices[k].area_id === this._config.area,
        );
        const e = Object.keys(this._hass.entities).filter(
            (k) =>
                this._hass.entities[k].area_id === this._config.area ||
                d.includes(this._hass.entities[k].device_id),
        );
        const counts = [
            [d.length, 'devices'],
            [e.length, 'entities'],
        ]
            .filter(([count]: [number]) => count > 0)
            .map(([count, type]) => `${count} ${type}`)
            .join(' ');

        return counts;
    }
}

// Register the custom card
customElements.define('room-summary-card', RoomSummaryCard);
window.customCards.push({
    type: 'room-summary-card',
    name: 'Room Summary Card',
    description:
        'A card to summarize the status of a room, including temperature, humidity, and any problem entities.',
});
