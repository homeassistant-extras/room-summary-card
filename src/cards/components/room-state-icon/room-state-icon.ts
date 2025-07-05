import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import type { HomeAssistant } from '@hass/types';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
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
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  public override render(): TemplateResult | typeof nothing {
    const { state } = this.entity;
    if (!state) return nothing;

    const iconStyle = renderEntityIconStyles(this.hass, this.entity);

    return html`
      ${stylesToHostCss(this.config?.styles?.entity_icon)}
      <div
        class="icon"
        style=${iconStyle}
        @action=${handleClickAction(this, this.entity)}
        .actionHandler=${actionHandler(this.entity)}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${state}
          .icon=${this.entity.config.icon}
        ></ha-state-icon>
      </div>
    `;
  }
}
