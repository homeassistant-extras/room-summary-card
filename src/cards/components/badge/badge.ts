import { getMatchingBadgeState } from '@delegates/utils/badge-state';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { HassUpdateMixin } from '@homeassistant-extras/hass/mixins/hass-update-mixin';
import { SubscribeEntityStateMixin } from '@homeassistant-extras/hass/mixins/subscribe-entity-state-mixin';
import { renderTileBadge } from '@homeassistant-extras/hass/panels/lovelace/cards/tile/badges/tile-badge';
import { processHomeAssistantColors } from '@theme/colors';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { BadgeConfig } from '@type/config/entity';
import { d } from '@util/debug';
import equal from 'fast-deep-equal';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import './badge-label';
import { styles } from './styles';

/**
 * Badge Component
 *
 * A small Lit element that renders a badge overlay for an entity.
 * Badges can display entity state icons, custom icons, or short text based on
 * configuration.
 */
export class Badge extends SubscribeEntityStateMixin(
  HassUpdateMixin(HassConfigMixin<typeof LitElement, Config>(LitElement)),
) {
  /**
   * Badge configuration
   */
  private _badge!: BadgeConfig;

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
  set badge(badge: BadgeConfig) {
    if (equal(badge, this._badge)) return;

    // Set position (convert underscores to hyphens for CSS)
    const position = badge.position ?? 'top_right';
    this.position = position.replaceAll('_', '-');

    this.entity = badge.entity_id;
    this._badge = badge;
  }

  /**
   * Only update if we have a state.
   */
  override shouldUpdate(changedProperties: PropertyValues) {
    return changedProperties.has('states');
  }

  /**
   * Render the badge
   */
  public override render(): TemplateResult | typeof nothing {
    const config = this.config;
    const hass = this.hass;
    const state = this.state!;
    const id = this.entity;

    d(config, 'badge', 'render', id);

    // For homeassistant mode, use renderTileBadge (HA's native badge helper)
    const badge = this._badge;
    if (badge.mode === 'homeassistant') {
      return renderTileBadge(state, hass) as TemplateResult;
    }

    const matchingState = getMatchingBadgeState(state, badge);

    // For if_match mode, only render if a state match is found
    if (badge.mode === 'if_match' && !matchingState) {
      return nothing;
    }

    const label = matchingState?.label ?? badge.label;

    return html`
      ${matchingState?.styles ? stylesToHostCss(matchingState.styles) : nothing}
      <ha-tile-badge
        style=${styleMap({
          '--tile-badge-background-color': processHomeAssistantColors(
            matchingState?.icon_color,
          ),
        })}
      >
        ${label
          ? html`
              <room-badge-label
                .hass=${hass}
                .config=${config}
                .entityId=${id ?? ''}
                .label=${label}
              ></room-badge-label>
            `
          : html`
              <ha-state-icon
                .hass=${hass}
                .stateObj=${state}
                .icon=${matchingState?.icon}
              ></ha-state-icon>
            `}
      </ha-tile-badge>
    `;
  }
}
