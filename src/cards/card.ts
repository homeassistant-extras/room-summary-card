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
import { hasFeature } from '@config/feature';
import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import { getIconEntities } from '@delegates/utils/icon-entities';
import { getRoomEntity } from '@delegates/utils/room-entity';
import type { HomeAssistant } from '@hass/types';
import { renderCardStyles } from '@theme/render/card-styles';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { styles } from '@theme/styles';
import type {
  Config,
  EntityInformation,
  EntityState,
  RoomInformation,
} from '@type/config';
import { getProblemEntities } from '../delegates/utils/card-entities';
import { renderAreaStatistics, renderLabel } from '../html/text';
const equal = require('fast-deep-equal');

export class RoomSummaryCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * The room state
   */
  @state()
  private _roomInformation!: RoomInformation;

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

  /**
   * The sensors to show state for
   */
  @state()
  private _sensors!: EntityState[];

  /**
   * Indicates if the card is in dark mode
   */
  @property({ type: Boolean, reflect: true })
  private isDarkMode!: boolean;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

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
    if (!equal(config, this._config)) {
      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.isDarkMode = hass.themes.darkMode;

    const roomInfo: RoomInformation = {
      area_name:
        getArea(this._hass, this._config.area)?.name ?? this._config.area,
    };
    const states = getIconEntities(hass, this._config);
    const roomEntity = getRoomEntity(hass, this._config);
    const { problemEntities, problemExists } = getProblemEntities(
      hass,
      this._config.area,
    );

    // Get legacy temperature and humidity sensors for backward compatibility
    // These are used if the user has not specified them in the config
    // and are not part of the sensors array
    // This is for backward compatibility with older configurations
    // that used these default sensors
    const temp =
      ((this._config as any).temperature_sensor ??
      hasFeature(this._config, 'exclude_default_entities'))
        ? undefined
        : `sensor.${this._config.area}_climate_air_temperature`;
    const humidity =
      ((this._config as any).humidity_sensor ??
      hasFeature(this._config, 'exclude_default_entities'))
        ? undefined
        : `sensor.${this._config.area}_climate_humidity`;

    // Get additional sensors from config
    const sensors = [temp, humidity, ...(this._config.sensors ?? [])]
      .map((sensorId) => getState(hass, sensorId))
      .filter((sensor) => sensor !== undefined);

    this._problemExists = problemExists;

    // Update states only if they've changed
    if (!equal(roomInfo, this._roomInformation)) {
      this._roomInformation = roomInfo;
    }
    if (!equal(roomEntity, this._roomEntity)) {
      this._roomEntity = roomEntity;
    }
    if (!equal(states, this._states)) {
      this._states = states;
    }
    if (!equal(problemEntities, this._problemEntities)) {
      this._problemEntities = problemEntities;
    }
    if (!equal(sensors, this._sensors)) {
      this._sensors = sensors;
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
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._roomInformation) {
      return nothing;
    }

    const handler = actionHandler(this._roomEntity);
    const label = renderLabel(this._hass, this._config, this._sensors);
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
      this._config,
      this._sensors,
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
            ${this._roomInformation.area_name}
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
}
