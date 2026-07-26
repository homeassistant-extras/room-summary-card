import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { SubscribeEntityStateMixin } from '@homeassistant-extras/hass/mixins/subscribe-entity-state-mixin';
import type { HassEntity } from '@homeassistant-extras/hass/ws/types';
import { getBackgroundOpacity } from '@theme/background/background-bits';
import {
  getEntityHuiImageConfig,
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
 * `getHuiImageConfig`), or — for icon placement — from the icon's own
 * entity (see `getEntityHuiImageConfig`). Layers stack in plain DOM
 * order — no z-index.
 */
@customElement('room-background-image')
export class RoomBackgroundImage extends SubscribeEntityStateMixin(
  HassConfigMixin<typeof LitElement, Config>(LitElement),
) {
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
   * Icon placement only: the entity rendered in the icon. Supplies its own
   * image (camera feed or `entity_picture`), which wins over the mapped
   * background config.
   *
   * Named `roomEntity` (not `entity`) because `SubscribeEntityStateMixin`
   * already owns `entity` for its own single-entity subscription
   * convenience (see `_opacityState`).
   */
  @property({
    attribute: false,
    hasChanged: (newVal: EntityInformation, oldVal: EntityInformation) =>
      !equal(newVal, oldVal),
  })
  roomEntity?: EntityInformation;

  /**
   * Whether the room is considered active — selects the active/inactive
   * theme opacity for the color layer. Fed by the card's delegates
   * (ambient-light-aware room activity is business logic that belongs
   * there, not in this component).
   */
  @property({ type: Boolean })
  isActive = false;

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

  /**
   * Whether the user gradient overlay is suppressed (`hide_gradient`).
   */
  @state()
  private _hideGradient = false;

  private _config?: Config;

  override set config(config: Config) {
    this._config = config;

    this._iconBackground =
      config.background?.options?.includes('icon_background') ?? false;
    this._hideGradient =
      config.background?.options?.includes('hide_gradient') ?? false;

    const mapped = getHuiImageConfig(this.hass, this._config);
    if (!equal(mapped, this._huiConfig)) {
      this._huiConfig = mapped;
    }

    // Subscribe to config.background.opacity when it names an entity_id, so
    // getBackgroundOpacity picks up its state (see SubscribeEntityStateMixin).
    // Only the instance that actually consumes --user-opacity subscribes: a
    // card renders one background layer per entity icon plus one for itself,
    // and subscribing from all of them would register N duplicate watchers
    // for the same entity.
    const opacity = config.background?.opacity;
    const wanted =
      this._ownsUserOpacity && typeof opacity === 'string' ? [opacity] : [];
    // Reassign only on a real change — `config` is re-set on every parent
    // render, and a fresh array each time would schedule a wasted update.
    if (!equal(wanted, this.entities)) {
      this.entities = wanted;
    }
  }

  /**
   * Whether this layer is the one the user-configured `background.opacity`
   * applies to. The card owns it normally; in `icon_background` mode it
   * moves to the main room icon (see the routing rule in
   * room-state-icon's styles). Every other layer ignores it, so they
   * neither subscribe to nor emit `--user-opacity`.
   */
  private get _ownsUserOpacity(): boolean {
    return this.icon
      ? this.room && this._iconBackground
      : !this._iconBackground;
  }

  /**
   * State of the entity referenced by `background.opacity`, when
   * configured as an entity_id (see `getBackgroundOpacity`).
   */
  private get _opacityState(): HassEntity | undefined {
    const opacity = this._config?.background?.opacity;
    return typeof opacity === 'string' ? this.states[opacity] : undefined;
  }

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * The entity's own image, used only in icon placement. Cameras map to
   * `camera_image` so the icon refreshes; everything else to its
   * `entity_picture` (see `getEntityHuiImageConfig`).
   */
  private get _entityHuiConfig(): HuiImageConfig | undefined {
    return this.icon ? getEntityHuiImageConfig(this.roomEntity) : undefined;
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
        !!this._entityHuiConfig ||
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
    this.toggleAttribute('hide-gradient', this._hideGradient);
    this._applyOpacity();
  }

  /**
   * Sets the background opacity vars on the host, where both this
   * component's layers and outside routing rules (room-state-icon's
   * icon fill) resolve them.
   */
  private _applyOpacity(): void {
    if (!this._config) return;
    const vars: Record<string, string | number | undefined> =
      getBackgroundOpacity(this._config, this.isActive, this._opacityState);

    // Layers that don't own the user opacity leave the var unset so their
    // fill falls through to the theme chain.
    if (!this._ownsUserOpacity) {
      vars['--user-opacity'] = undefined;
    }

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
    // The icon's own entity wins over the mapped background config.
    const hui: HuiImageConfig | undefined =
      this._entityHuiConfig ?? this._huiConfig;

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
