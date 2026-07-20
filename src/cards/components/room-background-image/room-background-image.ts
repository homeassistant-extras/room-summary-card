import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import type { HassEntity } from '@homeassistant-extras/hass/ws/types';
import { getBackgroundOpacity } from '@theme/background/background-bits';
import {
  getEntityPictureUrl,
  getHuiImageConfig,
  type HuiImageConfig,
} from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
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
 * `getHuiImageConfig`), or — for icon placement — from the entity's own
 * `entity_picture` (see `getEntityPictureUrl`). Layers stack in plain DOM
 * order — no z-index.
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
   * Icon placement only: whether this icon is the main room entity.
   * Only the main icon may take over the card background in
   * `icon_background` mode; other icons show only their own
   * `entity_picture`.
   */
  @property({ type: Boolean })
  room = false;

  /**
   * Icon placement only: the entity rendered in the icon. Supplies the
   * `entity_picture` image, which wins over the mapped background config.
   */
  @property({
    attribute: false,
    hasChanged: (newVal: EntityInformation, oldVal: EntityInformation) =>
      !equal(newVal, oldVal),
  })
  entity?: EntityInformation;

  /**
   * Whether the room is considered active — selects the active/inactive
   * theme opacity for the color layer.
   *
   * Transitional: fed by the card's delegates for now; once this
   * component subscribes to state itself (SubscribeEntityStateMixin) it
   * can derive activity and the opacity entity internally.
   */
  @property({ type: Boolean })
  isActive = false;

  /**
   * State of the entity referenced by `background.opacity` when it's
   * configured as an entity_id (see `getBackgroundOpacity`).
   * Transitional, same as `isActive`.
   */
  @property({
    attribute: false,
    hasChanged: (newVal?: HassEntity, oldVal?: HassEntity) =>
      !equal(newVal, oldVal),
  })
  opacityState?: HassEntity;

  /**
   * `hui-image` config mapped from `config.background`
   */
  @state()
  private _huiConfig?: HuiImageConfig;

  /**
   * Whether the background is delegated to the main icon
   * (`icon_background` option). Tracked as state so toggling the option
   * re-renders even when the mapped image config is unchanged.
   */
  @state()
  private _iconBackground = false;

  private _config?: Config;

  override set config(config: Config) {
    this._config = config;

    const mapped = getHuiImageConfig(this.hass, this._config);
    if (!equal(mapped, this._huiConfig)) {
      this._huiConfig = mapped;
    }
    this._iconBackground =
      config.background?.options?.includes('icon_background') ?? false;
  }

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * The entity's own picture, used only in icon placement
   */
  private get _entityPicture(): string | undefined {
    return this.icon ? getEntityPictureUrl(this.entity) : undefined;
  }

  /**
   * Whether the image layer renders in this placement, derived entirely
   * from config and the entity. Card placement: image configured and not
   * delegated to the icon. Icon placement: the entity's own picture, or
   * the mapped background when the main icon owns it (`icon_background`).
   */
  private get _showImage(): boolean {
    if (this.icon) {
      // this is rendered in a room-state-icon
      return (
        !!this._entityPicture ||
        (this.room && this._iconBackground && !!this._huiConfig)
      );
    }
    // this is rendered in a room-summary-card
    return !!this._huiConfig && !this._iconBackground;
  }

  /**
   * Reflects `image` so outside CSS (e.g. the card's dimming vars) can
   * key off whether an image is actually rendered here, and `icon-bg` —
   * on the card layer so its color ignores the user opacity, and on the
   * main icon's layer so room-state-icon routes that opacity to the
   * icon fill instead.
   */
  protected override willUpdate(): void {
    this.toggleAttribute('image', this._showImage);
    this.toggleAttribute(
      'icon-bg',
      this._iconBackground && (!this.icon || this.room),
    );
    this._applyOpacity();
  }

  /**
   * Sets the background opacity vars on the host, where both this
   * component's layers and outside routing rules (room-state-icon's
   * icon fill) resolve them.
   */
  private _applyOpacity(): void {
    if (!this._config) return;
    const vars = getBackgroundOpacity(
      this._config,
      this.isActive,
      this.opacityState,
    );
    for (const [name, value] of Object.entries(vars)) {
      if (value === undefined) {
        this.style.removeProperty(name);
      } else {
        this.style.setProperty(name, String(value));
      }
    }
  }

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render(): TemplateResult {
    const picture = this._entityPicture;
    const hui: HuiImageConfig | undefined = picture
      ? { image: picture }
      : this._huiConfig;

    return html`
      <div class="color"></div>
      ${this._showImage && hui
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
