import { renderStateIcon } from '@/html/icon';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { getIconEntities } from '@delegates/entities/icon-entities';
import type { HomeAssistant } from '@hass/types';
import { entityStyles } from '@theme/styles';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
const equal = require('fast-deep-equal');

/**
 * Entity Collection Component
 *
 * A custom Lit element that renders a collection of entity state icons in a
 * grid layout. The component handles:
 *
 * - Individual entity state icon rendering with proper styling
 * - Grid layout management for consistent entity positioning
 * - Integration with the renderStateIcon utility for consistent icon display
 * - Feature-based configuration support through the config object
 * - Internal generation of state icons from entity information
 * - Automatic retrieval of icon entities using getIconEntities utility
 * - Proper state display delegation to the icon rendering system
 *
 * @version See package.json
 */
export class EntityCollection extends HassUpdateMixin(LitElement) {
  /**
   * Home Assistant instance
   */
  private _hass!: HomeAssistant;

  /**
   * Card configuration object containing feature flags and entity settings
   */
  @property({ type: Object }) config!: Config;

  /**
   * Array of entity states to display in the collection
   */
  @state()
  private _entities!: EntityInformation[];

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return entityStyles;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  // @ts-ignore
  override set hass(hass: HomeAssistant) {
    const states = getIconEntities(hass, this.config);

    // Update entities only if they've changed
    if (!equal(states, this._entities)) {
      this._entities = states;
    }

    this._hass = hass;
  }

  public override render(): TemplateResult | typeof nothing {
    if (!this._hass || !this._entities) {
      return nothing;
    }

    const stateIcons = this._entities.map((entity) =>
      renderStateIcon(this, this._hass, entity, ['entity']),
    );

    return html`
      ${stylesToHostCss(this.config.styles?.entities)} ${stateIcons}
    `;
  }
}
