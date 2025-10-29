import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { hasEntityFeature, hasFeature } from '@config/feature';
import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import type { HomeAssistant } from '@hass/types';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { getThresholdResult } from '@theme/threshold-color';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styles } from './styles';
const equal = require('fast-deep-equal');

/**
 * Room State Icon Component
 *
 * A custom Lit element that renders a single entity state icon with proper styling
 * and action handling. This component encapsulates the functionality previously
 * provided by the renderStateIcon utility function.
 *
 * Features:
 * - Individual entity state icon rendering with proper styling
 * - Action handling for click events
 * - Integration with Home Assistant state management
 * - Support for custom icon configuration
 * - Proper state display delegation to the icon rendering system
 * - Optional entity labels when show_entity_labels feature is enabled
 *
 * @version See package.json
 */
export class RoomStateIcon extends HassUpdateMixin(LitElement) {
  /**
   * Home Assistant instance
   */
  @state()
  private _hass!: HomeAssistant;

  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Whether to show entity labels
   */
  @state()
  private _showLabels!: boolean;

  /**
   * Whether to hide the icon
   */
  @state()
  private _hideRoomIcon!: boolean;
  /**
   * Whether to hide the icon content
   */
  @state()
  private _hideIconContent!: boolean;

  /**
   * Entity information containing state and configuration
   */
  @property({ type: Object }) entity!: EntityInformation;

  /**
   * Whether this is the main room entity (for applying room-specific hiding logic)
   */
  @property({ type: Boolean, reflect: true, attribute: 'room' })
  isMainRoomEntity: boolean = false;

  /**
   * Whether the room has a background image
   */
  @property({ type: Boolean, reflect: true })
  image!: boolean;
  private _image?: string | null;

  /**
   * Whether the icon background is enabled
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-bg' })
  private iconBackground!: boolean;

  /**
   * Whether the room is considered active (for styling)
   */
  @property({ type: Boolean })
  isActive?: boolean;

  /**
   * Whether the room is occupied (for occupancy styling)
   */
  @property({ type: Boolean, reflect: true })
  occupied?: boolean;

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
  set config(config: Config) {
    if (!equal(config, this._config)) {
      this.iconBackground =
        config.background?.options?.includes('icon_background') ?? false;

      this._showLabels =
        config.features?.includes('show_entity_labels') ?? false;

      // Calculate hiding logic for main room entity
      if (this.isMainRoomEntity) {
        this._hideRoomIcon = hasFeature(config, 'hide_room_icon');
        this._hideIconContent =
          config.background?.options?.includes('hide_icon_only') || false;
      }

      this._config = config;
    }
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  // @ts-ignore
  override set hass(hass: HomeAssistant) {
    this._image = hasEntityFeature(this.entity, 'use_entity_icon')
      ? undefined
      : this.entity?.state?.attributes?.entity_picture;

    if (this._image) {
      d(this._config, 'room-state-icon - image', this._image);
      this.image = true;
      this.iconBackground = true;
      this._hideIconContent = true;
    }

    this._hass = hass;
  }

  public override render(): TemplateResult | typeof nothing {
    const { state } = this.entity;
    if (!state) return nothing;

    // If the icon should be completely hidden, return nothing
    if (this._hideRoomIcon)
      return html`<div
        class="box"
        @action=${handleClickAction(this, this.entity)}
        .actionHandler=${actionHandler(this.entity)}
      ></div>`;

    const thresholdResult = getThresholdResult(this.entity);

    const iconStyle = renderEntityIconStyles(
      this._hass,
      this.entity,
      this.isActive,
      this._image,
    );

    d(this._config, 'room-state-icon - iconStyle', iconStyle);

    const iconStyles = {
      ...this._config?.styles?.entity_icon,
      ...thresholdResult?.styles,
    };

    return html`
      ${stylesToHostCss(iconStyles)}
      <div
        class="icon"
        style=${iconStyle}
        @action=${handleClickAction(this, this.entity)}
        .actionHandler=${actionHandler(this.entity)}
      >
        ${this._hideIconContent
          ? nothing
          : html`<ha-state-icon
              .hass=${this._hass}
              .stateObj=${state}
              .icon=${thresholdResult?.icon || this.entity.config.icon}
            ></ha-state-icon>`}
        ${this._showLabels
          ? html`<div class="entity-label">
              ${computeEntityName(state, this._hass)}
            </div>`
          : nothing}
      </div>
    `;
  }
}
