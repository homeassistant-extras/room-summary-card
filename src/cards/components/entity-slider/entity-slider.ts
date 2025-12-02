import { renderRoomIcon } from '@/html/icon';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { setBrightness } from '@delegates/actions/brightness-control';
import { getIconEntities } from '@delegates/entities/icon-entities';
import type { HomeAssistant } from '@hass/types';
import { stylesToHostCss } from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { styles } from './styles';
const equal = require('fast-deep-equal');

/**
 * Entity Slider Component
 *
 * A custom Lit element that renders a single entity state icon in a
 * grid layout. The component handles:
 *
 * - Single entity state icon rendering with proper styling
 * - Grid layout management for consistent entity positioning
 * - Integration with the renderRoomIcon utility for consistent icon display
 * - Feature-based configuration support through the config object
 * - Internal generation of state icon from entity information
 * - Automatic retrieval of icon entities using getIconEntities utility
 * - Proper state display delegation to the icon rendering system
 *
 * @version See package.json
 */
export class EntitySlider extends HassUpdateMixin(LitElement) {
  /**
   * Home Assistant instance
   */
  private _hass!: HomeAssistant;

  /**
   * Card configuration object containing feature flags and entity settings
   */
  @property({ type: Object }) config!: Config;

  /**
   * Slider style - reflected to DOM as data-slider-style attribute
   */
  @property({ type: String, reflect: true, attribute: 'slider' })
  sliderStyle:
    | 'track'
    | 'minimalist'
    | 'line'
    | 'filled'
    | 'gradient'
    | 'dual-rail'
    | 'dots'
    | 'notched'
    | 'grid'
    | 'glow'
    | 'shadow-trail'
    | 'outlined' = 'minimalist';

  /**
   * Single entity state to display (first entity from the collection)
   */
  @state()
  private _entity!: EntityInformation | undefined;

  /**
   * Whether the icon is currently being dragged
   */
  @state()
  private _isDragging = false;

  /**
   * Vertical position of the icon (0-100, percentage from top)
   * Default: 50 (centered)
   */
  @state()
  private _yPosition = 100;

  /**
   * Store initial drag state
   */
  private _dragStartY = 0;
  private _dragStartPosition = 0;

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
  // @ts-ignore
  override set hass(hass: HomeAssistant) {
    d(this.config, 'entity-slider', 'set hass');

    // Update slider style from config
    this.sliderStyle = this.config?.slider_style || 'minimalist';
    const states = getIconEntities(hass, this.config);
    const firstEntity = {
      ...states[0],
      config: {
        ...states[0]?.config,
        tap_action: {
          action: 'none',
        },
        hold_action: {
          action: 'none',
        },
        double_tap_action: {
          action: 'none',
        },
      },
    } as EntityInformation;

    // Update entity only if it's changed
    if (!equal(firstEntity, this._entity)) {
      this._entity = firstEntity;

      // Update position based on brightness attribute
      const brightness = firstEntity?.state?.attributes?.brightness;
      if (brightness !== undefined && brightness !== null) {
        // Convert brightness (0-255) to position (100-0%)
        // Higher brightness = higher position (lower percentage, towards top)
        const brightnessNum = Number(brightness);
        this._yPosition = 100 - (brightnessNum / 255) * 100;
      } else {
        this._yPosition = 100;
      }
    }

    this._hass = hass;
  }

  /**
   * Handle drag start (mouse)
   */
  private readonly _handleDragStart = (e: MouseEvent): void => {
    this._isDragging = true;
    this._dragStartY = e.clientY;
    this._dragStartPosition = this._yPosition;

    document.addEventListener('mousemove', this._handleDragMove);
    document.addEventListener('mouseup', this._handleDragEnd);
  };

  /**
   * Handle drag start (touch)
   */
  private readonly _handleTouchStart = (e: TouchEvent): void => {
    if (!e.touches[0]) return;

    this._isDragging = true;
    this._dragStartY = e.touches[0].clientY;
    this._dragStartPosition = this._yPosition;

    document.addEventListener('touchmove', this._handleTouchMove);
    document.addEventListener('touchend', this._handleTouchEnd);
  };

  /**
   * Handle drag move (mouse)
   */
  private readonly _handleDragMove = (e: MouseEvent): void => {
    if (!this._isDragging) return;

    const containerHeight = this.offsetHeight;
    if (!containerHeight) return;

    const deltaY = e.clientY - this._dragStartY;
    const deltaPercent = (deltaY / containerHeight) * 100;

    // Update position with constraints (0-100%)
    this._yPosition = Math.max(
      0,
      Math.min(100, this._dragStartPosition + deltaPercent),
    );
  };

  /**
   * Handle drag move (touch)
   */
  private readonly _handleTouchMove = (e: TouchEvent): void => {
    if (!this._isDragging || !e.touches[0]) return;

    const containerHeight = this.offsetHeight;
    if (!containerHeight) return;

    const deltaY = e.touches[0].clientY - this._dragStartY;
    const deltaPercent = (deltaY / containerHeight) * 100;

    // Update position with constraints (0-100%)
    this._yPosition = Math.max(
      0,
      Math.min(100, this._dragStartPosition + deltaPercent),
    );
  };

  /**
   * Handle drag end (mouse)
   */
  private readonly _handleDragEnd = (): void => {
    this._isDragging = false;
    document.removeEventListener('mousemove', this._handleDragMove);
    document.removeEventListener('mouseup', this._handleDragEnd);

    // Update entity brightness: position (0-100%) to brightness (255-0)
    setBrightness(
      this._hass,
      this._entity?.state?.entity_id,
      Math.round((100 - this._yPosition) * 2.55),
    );
  };

  /**
   * Handle drag end (touch)
   */
  private readonly _handleTouchEnd = (): void => {
    this._isDragging = false;
    document.removeEventListener('touchmove', this._handleTouchMove);
    document.removeEventListener('touchend', this._handleTouchEnd);

    // Update entity brightness: position (0-100%) to brightness (255-0)
    setBrightness(
      this._hass,
      this._entity?.state?.entity_id,
      Math.round((100 - this._yPosition) * 2.55),
    );
  };

  public override render(): TemplateResult | typeof nothing {
    d(this.config, 'entity-slider', 'render');
    if (!this._hass || !this._entity) {
      return nothing;
    }

    const stateIcon = renderRoomIcon(this._hass, this._entity, this.config);

    // Set CSS custom property for slider position (used by filled and shadow-trail styles)
    this.style.setProperty('--slider-position', `${this._yPosition}%`);

    return html`
      ${stylesToHostCss(this.config.styles?.entities)}
      <div
        class="icon-container ${this._isDragging ? 'dragging' : ''}"
        style="top: ${this._yPosition}%"
        @mousedown=${this._handleDragStart}
        @touchstart=${this._handleTouchStart}
      >
        ${stateIcon}
      </div>
    `;
  }
}
