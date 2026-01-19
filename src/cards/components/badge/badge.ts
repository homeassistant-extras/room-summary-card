import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { getState } from '@delegates/retrievers/state';
import { getMatchingBadgeState } from '@delegates/utils/badge-state';
import { renderTileBadge } from '@hass/panels/lovelace/cards/tile/badges/tile-badge';
import type { HomeAssistant } from '@hass/types';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { BadgeConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './styles';

/**
 * Badge Component
 *
 * A small Lit element that renders a badge overlay for an entity.
 * Badges can display entity state icons or custom icons based on configuration.
 */
export class Badge extends HassUpdateMixin(LitElement) {
  /**
   * Home Assistant instance
   */
  private _hass!: HomeAssistant;

  /**
   * Badge configuration
   */
  @property({ type: Object })
  config!: BadgeConfig;

  /**
   * Parent entity information
   */
  @property({ type: Object })
  entity!: EntityInformation;

  /**
   * Badge position (reflective attribute)
   */
  @property({ type: String, reflect: true, attribute: 'position' })
  position: string = 'top-right';

  @state()
  private _entity?: EntityInformation;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Updates the component's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  // @ts-ignore
  override set hass(hass: HomeAssistant) {
    this._hass = hass;

    // Determine which entity to use for the badge (defaults to parent entity)
    const badgeEntityState = this.config.entity_id
      ? getState(this._hass.states, this.config.entity_id)
      : this.entity.state;

    // Create badge entity information
    this._entity = {
      config: this.entity.config,
      state: badgeEntityState,
    };

    // Set position (convert underscores to hyphens for CSS)
    const position = this.config.position ?? 'top_right';
    this.position = position.replace(/_/g, '-');
  }

  public override render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._entity?.state) {
      return nothing;
    }

    // For homeassistant mode, use renderTileBadge (HA's native badge helper)
    if (this.config.mode === 'homeassistant') {
      return renderTileBadge(this._entity.state, this._hass);
    }

    const matchingState = getMatchingBadgeState(this._entity, this.config);

    // For if_match mode, only render if a state match is found
    if (this.config.mode === 'if_match' && !matchingState) {
      return nothing;
    }

    return html`
      ${matchingState?.styles ? stylesToHostCss(matchingState.styles) : nothing}
      <ha-tile-badge
        style=${styleMap({
          '--tile-badge-background-color': matchingState?.icon_color,
        })}
      >
        <ha-state-icon
          .hass=${this._hass}
          .stateObj=${this._entity.state}
          .icon=${matchingState?.icon ?? this.entity.config.icon}
        ></ha-state-icon>
      </ha-tile-badge>
    `;
  }
}
