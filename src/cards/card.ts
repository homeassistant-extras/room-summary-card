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

import { renderProblemIndicator, renderRoomIcon } from '@/html/icon';
import { getRoomProperties } from '@delegates/utils/setup-card';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import { info } from '@html/info';
import { renderCardStyles } from '@theme/render/card-styles';
import { styles } from '@theme/styles';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { d } from '@util/debug';
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
   * Information about the room entity
   */
  @state()
  private _roomEntity!: EntityInformation;

  /**
   * The sensors to show state for
   */
  @state()
  private _sensors!: SensorData;

  /**
   * Whether the room is considered active (for styling)
   */
  @state()
  private _isActive: boolean = false;

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
  @property({ type: Boolean, reflect: true })
  private occupied!: boolean;
  @property({ type: Boolean, reflect: true, attribute: 'icon-bg' })
  private iconBackground!: boolean;
  @property({ type: Boolean, reflect: true, attribute: 'background-image' })
  private backgroundImage!: boolean;
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

      this.iconBackground =
        this._config.background?.options?.includes('icon_background') ?? false;

      // Check if background image is configured (either image or image_entity)
      const hasBackgroundImage = !!(
        this._config.background?.image || this._config.background?.image_entity
      );
      // Check if background is disabled
      const isBackgroundDisabled =
        this._config.background?.options?.includes('disable') ?? false;
      this.backgroundImage = hasBackgroundImage && !isBackgroundDisabled;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    d(this._config, 'room-summary-card', 'set hass');
    const {
      roomInfo,
      roomEntity,
      sensors,
      image,
      isActive,
      flags: { occupied, dark, hot, humid },
    } = getRoomProperties(hass, this._config);

    this.occupied = occupied;
    this.dark = dark;
    this.hot = hot;
    this.humid = humid;
    this.image = !!image;
    this._image = image;
    this._isActive = isActive;
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
    } else {
      // update children who are subscribed
      fireEvent(this, 'hass-update', {
        hass,
      });
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
    d(this._config, 'room-summary-card', 'render');
    if (!this._hass) {
      return nothing;
    }

    const roomEntity = renderRoomIcon(
      this._hass,
      this._roomEntity,
      this._config,
      true,
      this._isActive,
    );

    const cardStyle = renderCardStyles(
      this._hass,
      this._config,
      this._roomEntity,
      this.occupied,
      this._image,
      this._isActive,
    );

    const problems = renderProblemIndicator(
      this._hass,
      this._config,
      this._sensors,
    );

    return html`
      <ha-card style="${cardStyle}">
        <div class="grid">
          ${info(
            this,
            this._hass,
            this._roomInformation,
            this._roomEntity,
            this._config,
            this._sensors,
            this._isActive,
          )}

          <!-- Room Icon -->
          ${roomEntity}

          <!-- Entities Container -->
          <entity-collection
            .config=${this._config}
            .hass=${this._hass}
          ></entity-collection>

          <!-- Problem Indicator -->
          ${problems}
        </div>
      </ha-card>
    `;
  }
}
