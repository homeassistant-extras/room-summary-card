import { renderRoomIcon } from '@/html/icon';
import { getIconEntities } from '@delegates/entities/icon-entities';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { HassUpdateMixin } from '@homeassistant-extras/hass/mixins/hass-update-mixin';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { d } from '@util/debug';
import equal from 'fast-deep-equal';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
/**
 * Entity Collection Component
 *
 * A custom Lit element that renders a collection of entity state icons in a
 * grid layout. The component handles:
 *
 * - Individual entity state icon rendering with proper styling
 * - Grid layout management for consistent entity positioning
 * - Integration with the renderRoomIcon utility for consistent icon display
 * - Feature-based configuration support through the config object
 * - Internal generation of state icons from entity information
 * - Automatic retrieval of icon entities using getIconEntities utility
 * - Proper state display delegation to the icon rendering system
 *
 * @version See package.json
 */
export class EntityCollection extends HassUpdateMixin(
  HassConfigMixin<typeof LitElement, Config>(LitElement),
) {
  /**
   * Home Assistant instance
   */
  private _hass!: HomeAssistant;

  /**
   * Array of entity states to display in the collection
   */
  @state()
  private _entities!: EntityInformation[];

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  override set hass(hass: HomeAssistant) {
    d(this.config, 'entity-collection', 'set hass');
    const states = getIconEntities(hass, this.config);

    // Update entities only if they've changed
    if (!equal(states, this._entities)) {
      this._entities = states;
      // Drives --entity-columns (strip width) in styles.ts
      this.style.setProperty('--entity-count', `${states.length}`);
    }

    this._hass = hass;
  }

  public override render(): TemplateResult | typeof nothing {
    d(this.config, 'entity-collection', 'render');
    if (!this._hass || !this._entities) {
      return nothing;
    }

    const stateIcons = this._entities.map((entity) =>
      renderRoomIcon(this._hass, entity, this.config),
    );

    return html`
      ${stylesToHostCss(this.config.styles?.entities)} ${stateIcons}
    `;
  }
}
