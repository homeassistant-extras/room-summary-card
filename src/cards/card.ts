/**
 * Room Summary Card Component
 *
 * A custom element that displays a summary of room information in Home Assistant.
 * This card shows room state, climate information, and various entity states in a
 * grid layout with interactive elements.
 *
 * @version See package.json
 */

import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import { renderProblemIndicator, renderStateIcon } from '@/html/icon';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import { renderCardStyles } from '@theme/render/card-styles';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { styles } from '@theme/styles';
import type { Config, EntityInformation, EntityState } from '@type/config';
import { version } from '../../package.json';
import {
  getIconEntities,
  getProblemEntities,
  getRoomEntity,
} from '../delegates/utils/card-entities';
import { renderAreaStatistics, renderLabel } from '../html/text';
const equal = require('fast-deep-equal');

export class RoomSummaryCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Array of entity states to display in the card
   */
  @state()
  private _states!: EntityInformation[];

  /**
   * Information about the room entity
   */
  @state()
  private _roomEntity!: EntityInformation;

  /**
   * List of entity IDs that have problems
   */
  @state()
  private _problemEntities: string[] = [];

  /**
   * Indicates if any problems exist in the room
   */
  @state()
  private _problemExists: boolean = false;

  @state()
  private _temperature!: EntityState | undefined;

  @state()
  private _humidity!: EntityState | undefined;

  /**
   * Indicates if the card is in dark mode
   */
  @property({ type: Boolean, reflect: true })
  private isDarkMode!: Boolean;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  constructor() {
    super();
    console.info(
      `%c🐱 Poat's Tools: room-summary-card - ${version}`,
      'color: #CFC493;',
    );
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._states) {
      return nothing;
    }

    const area = this._formatAreaName();
    const handler = actionHandler(this._roomEntity);
    const label = renderLabel(this._hass, this._config);
    const action = handleClickAction(this, this._roomEntity);
    const stats = renderAreaStatistics(this._hass, this._config);
    const { textStyle } = renderEntityIconStyles(
      this._hass,
      this._roomEntity.state,
    );
    const roomEntity = renderStateIcon(this, this._hass, this._roomEntity, [
      'room',
    ]);
    const stateIcons = this._states.map((s, i) =>
      renderStateIcon(this, this._hass, s, ['entity', `entity-${i + 1}`]),
    );
    const cardStyle = renderCardStyles(
      this._hass,
      this._temperature,
      this._humidity,
      this._roomEntity.state,
    );
    const problems = renderProblemIndicator(
      this._problemEntities,
      this._problemExists,
    );

    return html`
      <div class="card" style="${cardStyle}">
        <div class="grid">
          <!-- Room Name -->
          <div
            class="name text"
            style=${textStyle}
            @action=${action}
            .actionHandler=${handler}
          >
            ${area}
          </div>

          <!-- Climate Information -->
          <div
            class="label text"
            style=${textStyle}
            @action=${action}
            .actionHandler=${handler}
          >
            ${label} ${stats}
          </div>

          <!-- State Icons -->
          ${roomEntity} ${stateIcons}

          <!-- Problem Indicator -->
          ${problems}
        </div>
      </div>
    `;
  }

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
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

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.isDarkMode = hass.themes.darkMode;

    const states = getIconEntities(hass, this._config);
    const roomEntity = getRoomEntity(hass, this._config);
    const { problemEntities, problemExists } = getProblemEntities(
      hass,
      this._config.area,
    );
    const tempState = getState(hass, this._config!.temperature_sensor);
    const humidState = getState(hass, this._config!.humidity_sensor);

    this._problemExists = problemExists;

    // Update states only if they've changed
    if (!equal(roomEntity, this._roomEntity)) {
      this._roomEntity = roomEntity;
    }
    if (!equal(states, this._states)) {
      this._states = states;
    }
    if (!equal(problemEntities, this._problemEntities)) {
      this._problemEntities = problemEntities;
    }
    if (!equal(tempState, this._temperature)) {
      this._temperature = tempState;
    }
    if (!equal(humidState, this._humidity)) {
      this._humidity = humidState;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('room-summary-card-editor');
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    // Get all area IDs and their friendly names
    const areas = Object.entries(hass.areas);

    // Find the first area that has matching entities
    const matchingArea = areas.find(([areaId, area]) => {
      const areaName = area.area_id.toLowerCase().replace(/\s+/g, '_');

      // Check if either entity exists for this area
      const hasLight = `light.${areaName}_light` in hass.entities;
      const hasFan = `switch.${areaName}_fan` in hass.entities;

      // Return true if either entity exists
      return hasLight || hasFan;
    });

    // Return the matching area ID or empty string if none found
    return {
      area: matchingArea ? matchingArea[0] : '',
    };
  }

  /**
   * Formats the area name with proper capitalization
   * @returns {string} Formatted area name
   */
  private _formatAreaName(): string {
    return this._config.area
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
