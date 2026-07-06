import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { backgroundToHuiConfig } from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import {
  type CSSResult,
  html,
  LitElement,
  nothing,
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
 * The host applies one opacity/filter to the composite, so the image paints
 * over the color inside the layer (color never bleeds through the image) —
 * the same result the single `::before` used to produce.
 *
 * `hui-image` is rendered directly in this component's template (not via
 * `hui-image-element`) so it lives in our shadow root where we can size it:
 * an absolutely positioned fill layer whose inner img covers it
 * (`object-fit: cover`). This keeps `hui-image` in its plain `<img>` mode -
 * the same path `hui-picture-entity-card` uses - which never blanks a
 * previously loaded image (its ratio mode repaints from a source captured
 * during load events and goes blank between captures).
 *
 * Placement is signalled by the `icon` attribute (set by `room-state-icon`):
 * icon placement clips to the icon circle, uses the icon opacity/filter
 * chain, and skips the color layer (`.icon::before` still owns the circle
 * color and alarm animations). Card placement skips the image when
 * `icon_background` routes it to the icon, but keeps the color layer.
 */
@customElement('room-background-image')
export class RoomBackgroundImage extends HassConfigMixin<
  typeof LitElement,
  Config
>(LitElement) {
  /**
   * Whether this instance backs the room icon instead of the whole card.
   */
  @property({ type: Boolean, reflect: true })
  icon = false;

  /**
   * Whether `icon_background` routes the image (and its opacity) to the icon.
   *
   * Reflected so the card-level host can drop `--user-opacity` in CSS: that
   * variable is set inline on `ha-card` and inherits here, so a stylesheet
   * rule on `ha-card` can't override it (inline wins). We instead ignore it
   * at this host when the icon owns the background.
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-bg' })
  iconBg = false;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    const mapped =
      this.hass && this.config
        ? backgroundToHuiConfig(this.hass, this.config)
        : undefined;

    // At card level the image is skipped when the icon owns it
    const options = this.config?.background?.options;
    const iconBackground = options?.includes('icon_background') ?? false;
    this.iconBg = iconBackground;
    const showImage = mapped !== undefined && (this.icon || !iconBackground);
    const showGradient = showImage && !options?.includes('hide_gradient');

    if (this.icon && !showImage) return nothing;

    // hui-image resolves media-source content ids itself
    const image =
      typeof mapped?.image === 'object'
        ? mapped.image.media_content_id
        : mapped?.image;

    const gradient = showGradient ? html`<div class="overlay"></div>` : nothing;
    const colorLayer = this.icon ? nothing : html`<div class="color"></div>`;
    const imageLayer =
      showImage && mapped
        ? html`
            <hui-image
              .hass=${this.hass}
              .entity=${mapped.image_entity}
              .image=${image}
              .cameraImage=${mapped.camera_image}
              .cameraView=${mapped.camera_view}
              fit-mode="cover"
            ></hui-image>
            ${gradient}
          `
        : nothing;

    return html`${colorLayer}${imageLayer}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'room-background-image': RoomBackgroundImage;
  }
}
