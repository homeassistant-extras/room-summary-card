import { hasFeature } from '@/config/feature';
import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import type { HomeAssistant } from '@hass/types';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { getThresholdIcon } from '@theme/threshold-color';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styles } from './styles';

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
  @property({ type: Object }) override hass!: HomeAssistant;

  /**
   * Entity information containing state and configuration
   */
  @property({ type: Object }) entity!: EntityInformation;

  /**
   * Card configuration object containing style settings
   */
  @property({ type: Object }) config?: Config;

  /**
   * Whether this is the main room entity (for applying room-specific hiding logic)
   */
  @property({ type: Boolean, reflect: true, attribute: 'room' })
  isMainRoomEntity: boolean = false;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  public override render(): TemplateResult | typeof nothing {
    const { state } = this.entity;
    if (!state) return nothing;

    // Calculate hiding logic for main room entity
    let hideIcon = false;
    let hideIconContent = false;

    if (this.isMainRoomEntity && this.config) {
      hideIcon = hasFeature(this.config, 'hide_room_icon');
      hideIconContent =
        this.config.background?.options?.includes('hide_icon_only') || false;
    }

    // If the icon should be completely hidden, return nothing
    if (hideIcon) return nothing;

    const iconStyle = renderEntityIconStyles(this.hass, this.entity);
    const thresholdIcon = getThresholdIcon(this.entity);
    const showLabels =
      this.config && hasFeature(this.config, 'show_entity_labels');

    return html`
      ${stylesToHostCss(this.config?.styles?.entity_icon)}
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
              .icon=${thresholdIcon || this.entity.config.icon}
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
