import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import type { Config } from '@type/config';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';

/**
 * Room Background Image Component
 *
 * Owns the card (or icon) background stack in a single layer:
 *
 * 1. `.color` — the theme background color (card placement only; replaces
 *    the old `ha-card::before` color overlay)
 * 2. `hui-image` — the image, delegated to HA: media-source resolution,
 *    `image.*` entity URLs, camera thumbnails with periodic refresh, and
 *    load/error states
 * 3. `.overlay` — the user gradient (`--user-background-image-overlay`)
 *
 * The image is still painted from the `--background-image` CSS variable
 * (with the gradient composited on top); delegating it to `hui-image`
 * comes later. Layers stack in plain DOM order — no z-index.
 */
@customElement('room-background-image')
export class RoomBackgroundImage extends HassConfigMixin<
  typeof LitElement,
  Config
>(LitElement) {
  /**
   * Render as an icon-circle background instead of the card body
   */
  @property({ type: Boolean, reflect: true })
  icon = false;

  /**
   * Whether a background image is configured / resolved
   */
  @property({ type: Boolean })
  image = false;

  override render(): TemplateResult {
    return html`
      <div class="color"></div>
      ${this.image ? html`<div class="image"></div>` : nothing}
    `;
  }

  static override get styles(): CSSResult {
    return styles;
  }
}
