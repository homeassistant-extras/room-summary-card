import { hasFeature } from '@/config/feature';
import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import type { HomeAssistant } from '@hass/types';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { getThresholdResult } from '@theme/threshold-color';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
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
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Home Assistant instance
   */
  @property({ type: Object }) override hass!: HomeAssistant;

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

      this._config = config;
    }
  }

  public override render(): TemplateResult | typeof nothing {
    const { state } = this.entity;
    if (!state) return nothing;

    // Calculate hiding logic for main room entity
    let hideIcon = false;
    let hideIconContent = false;

    if (this.isMainRoomEntity && this._config) {
      hideIcon = hasFeature(this._config, 'hide_room_icon');
      hideIconContent =
        this._config.background?.options?.includes('hide_icon_only') || false;
    }

    // If the icon should be completely hidden, return nothing
    if (hideIcon)
      return html`<div
        class="box"
        @action=${handleClickAction(this, this.entity)}
        .actionHandler=${actionHandler(this.entity)}
      ></div>`;

    const thresholdResult = getThresholdResult(this.entity);

    const iconStyle = renderEntityIconStyles(
      this.hass,
      this.entity,
      this.isActive,
    );
    const showLabels =
      this._config && hasFeature(this._config, 'show_entity_labels');

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
        ${hideIconContent
          ? nothing
          : html`<ha-state-icon
              .hass=${this.hass}
              .stateObj=${state}
              .icon=${thresholdResult?.icon || this.entity.config.icon}
            ></ha-state-icon>`}
        ${showLabels
          ? html`<div class="entity-label">
              ${computeEntityName(state, this.hass)}
            </div>`
          : nothing}
      </div>
    `;
  }
}
