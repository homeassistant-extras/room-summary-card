import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { SubscribeEntityStateMixin } from '@cards/mixins/subscribe-entity-state-mixin';
import { getMatchingBadgeState } from '@delegates/utils/badge-state';
import { renderTileBadge } from '@hass/panels/lovelace/cards/tile/badges/tile-badge';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { BadgeConfig } from '@type/config/entity';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './styles';
const equal = require('fast-deep-equal');

/**
 * Badge Component
 *
 * A small Lit element that renders a badge overlay for an entity.
 * Badges can display entity state icons or custom icons based on configuration.
 */
export class Badge extends SubscribeEntityStateMixin(
  HassUpdateMixin(LitElement),
) {
  /**
   * Badge configuration
   */
  private _config!: BadgeConfig;

  /**
   * Card config for debug
   */
  cardConfig?: Config;

  /**
   * Badge position (reflective attribute)
   */
  @property({ type: String, reflect: true, attribute: 'position' })
  position: string = 'top-right';

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Badge configuration
   */
  set config(config: BadgeConfig) {
    d(this.cardConfig, 'badge', 'set config');
    if (equal(config, this._config)) return;

    // Set position (convert underscores to hyphens for CSS)
    const position = config.position ?? 'top_right';
    this.position = position.replaceAll('_', '-');

    this.entityId = config.entity_id;
    this._config = config;
  }

  /**
   * Render the badge
   */
  public override render(): TemplateResult | typeof nothing {
    d(this.cardConfig, 'badge', 'render');

    // entity_id is always set (by renderBadgeElements from user config or parent)
    const state = this._subscribedEntityState;
    const hass = this.hass;
    if (!hass || !state) {
      return nothing;
    }

    // For homeassistant mode, use renderTileBadge (HA's native badge helper)
    const config = this._config;
    if (config.mode === 'homeassistant') {
      return renderTileBadge(state, hass);
    }

    const matchingState = getMatchingBadgeState(state, config);

    // For if_match mode, only render if a state match is found
    if (config.mode === 'if_match' && !matchingState) {
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
          .hass=${hass}
          .stateObj=${state}
          .icon=${matchingState?.icon}
        ></ha-state-icon>
      </ha-tile-badge>
    `;
  }
}
