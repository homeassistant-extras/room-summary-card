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

import { renderProblemIndicator, renderStateIcon } from '@/html/icon';
import { hasFeature } from '@config/feature';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { getRoomProperties } from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { info } from '@html/info';
import { renderCardStyles } from '@theme/render/card-styles';
import { styles } from '@theme/styles';
import type {
  Config,
  EntityInformation,
  RoomInformation,
  SensorData,
} from '@type/config';
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
  private _sensors!: SensorData;

  /**
   * Flags for various states
   */
  @property({ type: Boolean, reflect: true })
  private dark!: boolean;
  @property({ type: Boolean, reflect: true })
  private hot!: boolean;
  @property({ type: Boolean, reflect: true })
  private humid!: boolean;
  @property({ type: Boolean, reflect: true })
  private image!: boolean;
  private _image?: string | null;

  /**
   * Home Assistant instance
   * Marked as @state since we selectively update hass
   * to avoid unnecessary re-renders
   */
  @state()
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
    const {
      roomInfo,
      states,
      roomEntity,
      problemEntities,
      sensors,
      image,
      flags: { problemExists, dark, hot, humid },
    } = getRoomProperties(hass, this._config);

    this._problemExists = problemExists;
    this.dark = dark;
    this.hot = hot;
    this.humid = humid;
    this.image = !!image;
    this._image = image;

    // Update states only if they've changed
    let shouldRender = false;
    if (!equal(roomInfo, this._roomInformation)) {
      this._roomInformation = roomInfo;
      shouldRender = true;
    }
    if (!equal(roomEntity, this._roomEntity)) {
      this._roomEntity = roomEntity;
      shouldRender = true;
    }
    if (!equal(states, this._states)) {
      this._states = states;
      shouldRender = true;
    }
    if (!equal(problemEntities, this._problemEntities)) {
      this._problemEntities = problemEntities;
      shouldRender = true;
    }
    if (!equal(sensors, this._sensors)) {
      this._sensors = sensors;
      shouldRender = true;
    }

    if (
      shouldRender ||
      hass.formatEntityState !== this._hass?.formatEntityState
    ) {
      // normally we wouldn't need to update the hass object this way,
      // but since state-display is using the formatEntityState function
      // we need to ensure it is updated when the new function is available
      // this is a workaround and prevents the need to re-render the card many times
      // https://github.com/home-assistant/frontend/issues/25648
      this._hass = hass;
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
    if (!this._hass) {
      return nothing;
    }

    const hide = hasFeature(this._config, 'hide_room_icon');
    const roomEntity = hide
      ? undefined
      : renderStateIcon(this, this._hass, this._roomEntity, ['room']);

    const stateIcons = this._states.map((s) =>
      renderStateIcon(this, this._hass, s, ['entity']),
    );

    const cardStyle = renderCardStyles(
      this._hass,
      this._config,
      this._roomEntity,
      this._image,
    );

    const problems = renderProblemIndicator(
      this._problemEntities,
      this._problemExists,
    );

    const handler = actionHandler(this._roomEntity);
    const action = handleClickAction(this, this._roomEntity);
    return html`
      <ha-card style="${cardStyle}">
        <div class="grid">
          <div class="hitbox" @action=${action} .actionHandler=${handler}></div>
          ${info(
            this,
            this._hass,
            this._roomInformation,
            this._roomEntity,
            this._config,
            this._sensors,
          )}

          <!-- Room Icon -->
          ${roomEntity}

          <!-- Entities Container (Flexbox) -->
          <div class="entities-container">${stateIcons}</div>

          <!-- Problem Indicator -->
          ${problems}
        </div>
      </ha-card>
    `;
  }
}
