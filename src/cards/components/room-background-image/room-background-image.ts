import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import {
  getHuiImageConfig,
  type HuiImageConfig,
} from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import equal from 'fast-deep-equal';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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
 * 3. `.image::after` — the user gradient (`--user-background-image-overlay`)
 *
 * The image source is mapped from `config.background` (see
 * `getHuiImageConfig`), or overridden with an explicit `imageUrl` (used by
 * `room-state-icon` for per-entity `entity_picture` icons). Layers stack in
 * plain DOM order — no z-index.
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
   * Whether the parent wants the image layer shown (placement gating,
   * e.g. the card hides its layer in `icon_background` mode)
   */
  @property({ type: Boolean })
  image = false;

  /**
   * Explicit image URL override; bypasses the background config mapping
   */
  @property()
  imageUrl?: string;

  /**
   * `hui-image` config mapped from `config.background`
   */
  @state()
  private _huiConfig?: HuiImageConfig;

  private _config?: Config;

  override set config(config: Config) {
    this._config = config;

    const mapped = getHuiImageConfig(this.hass, this._config);
    if (!equal(mapped, this._huiConfig)) {
      this._huiConfig = mapped;
    }
  }

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render(): TemplateResult {
    const hui: HuiImageConfig | undefined = this.imageUrl
      ? { image: this.imageUrl }
      : this._huiConfig;

    return html`
      <div class="color"></div>
      ${this.image && hui
        ? html`
            <div class="image">
              <hui-image
                .hass=${this.hass}
                .image=${hui.image}
                .cameraImage=${hui.camera_image}
                .cameraView=${hui.camera_view}
                .fitMode=${'cover'}
              ></hui-image>
            </div>
          `
        : nothing}
    `;
  }
}
