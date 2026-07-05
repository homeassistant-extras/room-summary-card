import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { backgroundToHuiConfig } from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Room Background Image Component
 *
 * Renders the card (or icon) background image by delegating the image
 * lifecycle to HA's `hui-image`: media-source resolution, `image.*` entity
 * URLs, camera thumbnails with periodic refresh, and load/error states.
 *
 * `hui-image` is rendered directly in this component's template (not via
 * `hui-image-element`) so it lives in our shadow root where we can size it:
 * an absolutely positioned fill layer whose inner img covers it
 * (`object-fit: cover`). This keeps `hui-image` in its plain `<img>` mode -
 * the same path `hui-picture-entity-card` uses - which never blanks a
 * previously loaded image (its ratio mode repaints from a source captured
 * during load events and goes blank between captures).
 *
 * This component only owns:
 * - mapping the card `background` config via `backgroundToHuiConfig`
 * - the fill sizing and the user gradient overlay
 *   (`--user-background-image-overlay`), painted above the image inside
 *   this layer so host opacity applies to both
 */
@customElement('room-background-image')
export class RoomBackgroundImage extends HassConfigMixin<
  typeof LitElement,
  Config
>(LitElement) {
  static override readonly styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      overflow: hidden;
      pointer-events: none;
      border-radius: inherit;
    }

    hui-image,
    .overlay {
      position: absolute;
      inset: 0;
    }

    .overlay {
      background-image: var(--user-background-image-overlay, none);
      background-repeat: no-repeat;
      background-position: center center;
      background-size: cover;
    }
  `;

  protected override render(): TemplateResult | typeof nothing {
    const mapped = backgroundToHuiConfig(this.hass, this.config);
    if (!mapped) return nothing;

    // hui-image resolves media-source content ids itself
    const image =
      typeof mapped.image === 'object'
        ? mapped.image.media_content_id
        : mapped.image;

    return html`
      <hui-image
        .hass=${this.hass}
        .entity=${mapped.image_entity}
        .image=${image}
        .cameraImage=${mapped.camera_image}
        .cameraView=${mapped.camera_view}
        fit-mode="cover"
      ></hui-image>
      <div class="overlay"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'room-background-image': RoomBackgroundImage;
  }
}
