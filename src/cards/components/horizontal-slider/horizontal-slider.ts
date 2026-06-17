/**
 * Horizontal Slider Component
 *
 * Renders a horizontal slider strip flush with the bottom edge of the
 * room-summary-card. The component decides on its own whether to render:
 * if no entity in the card config has a `slider` config block, it renders
 * `nothing`, so the parent card can unconditionally place it in its
 * template.
 *
 * Always renders Home Assistant's <ha-slider>. The visual variant is
 * controlled per-entity via `entity.slider.style`:
 *  - `'ha'`           : the standard HA slider look (thin track + thumb).
 *  - `'bar'` (default): ha-slider re-styled as a chunky full-height bar.
 *
 * Entity wiring
 * -------------
 * Extends `SubscribeEntityStateMixin(HassUpdateMixin(LitElement))`, so
 * `hass`, `config`, and the live `state` of the slider entity are managed
 * by the mixins. The bound entity is the first one (scanning `entity`
 * then `entities`) with a `slider` config block. `min` / `max` / `step`
 * are read from `state.attributes` and the current `value` from
 * `state.state` —
 * same pattern used by `hui-input-number-entity-row` /
 * `hui-number-entity-row` upstream (`setValue`).
 *
 * Domain specials:
 *  - `media_player` : slider exposes 0–100; reads `volume_level` (0–1)
 *                     and writes via `setMediaPlayerVolume`.
 *  - `light`        : slider exposes 0–255; reads `brightness` and
 *                     writes via `setBrightness` (which itself turns
 *                     the light off when value is 0).
 *
 * @see https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/entity-rows/hui-input-number-entity-row.ts
 *
 * @version See package.json
 */

import { setBrightness } from '@delegates/actions/brightness-control';
import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
import { setValue } from '@homeassistant-extras/hass/data/input_text';
import { setMediaPlayerVolume } from '@homeassistant-extras/hass/data/media-player';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { HassUpdateMixin } from '@homeassistant-extras/hass/mixins/hass-update-mixin';
import { SubscribeEntityStateMixin } from '@homeassistant-extras/hass/mixins/subscribe-entity-state-mixin';
import type { Config } from '@type/config';
import type { EntityConfig, HorizontalSliderStyle } from '@type/config/entity';
import { d } from '@util/debug';
import equal from 'fast-deep-equal';
import {
  LitElement,
  html,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';

@customElement('horizontal-slider')
export class HorizontalSlider extends SubscribeEntityStateMixin(
  HassUpdateMixin(HassConfigMixin<typeof LitElement, Config>(LitElement)),
) {
  /**
   * The entity configuration for the slider.
   */
  _slider!: EntityConfig;

  /**
   * Selected visual style — derived from config in the `config` setter.
   * Reflected as [variant] for CSS scoping (not `style`, which is reserved).
   */
  @property({ type: String, reflect: true, attribute: 'variant' })
  private _style: HorizontalSliderStyle | undefined;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  public set slider(value: EntityConfig) {
    if (equal(value, this.slider)) return;

    this._slider = value;
    this.entity = value?.entity_id;
    // only set style if slider is defined as to not affect other components
    this._style = value ? (value.slider?.style ?? 'bar') : undefined;
  }

  /**
   * `media_player` → `volume_set`, `light` → `setBrightness`,
   * everything else → `{domain}.set_value`.
   */
  private readonly _handleChange = (ev: Event): void => {
    const hass = this.hass;
    const state = this.state;
    if (!hass || !state) return;

    const target = ev.target as HTMLInputElement;
    const domain = computeDomain(state.entity_id);

    if (domain === 'media_player') {
      void setMediaPlayerVolume(
        hass,
        state.entity_id,
        Number(target.value) / 100,
      );
      return;
    }

    if (domain === 'light') {
      void setBrightness(hass, state.entity_id, Number(target.value));
      return;
    }

    void setValue(hass, state.entity_id, target.value);
  };

  public override render(): TemplateResult | typeof nothing {
    d(this.config, 'horizontal-slider', 'render');
    const s = this.state;
    if (!s) return nothing;

    const domain = computeDomain(s.entity_id);
    const rawValue = s ? Number(s.state) : Number.NaN;
    let value = 0;
    let min = Number(s?.attributes.min ?? 0);
    let max = Number(s?.attributes.max ?? 100);
    let step = Number(s?.attributes.step ?? 1);

    if (domain === 'media_player') {
      const vol = s.attributes.volume_level;
      value =
        vol == null
          ? 0
          : Math.max(0, Math.min(100, Math.round(Number(vol) * 100)));
    } else if (domain === 'light') {
      // Slider operates on raw brightness (0–255); attributes.brightness
      // is null when the light is off.
      value = Number(s.attributes.brightness ?? 0);
      min = 0;
      max = 255;
      step = 1;
    } else if (Number.isFinite(rawValue)) {
      value = rawValue;
    }

    return html`
      <ha-slider
        labeled
        .min=${min}
        .max=${max}
        .step=${step}
        .value=${value}
        .disabled=${!s}
        @change=${this._handleChange}
      ></ha-slider>
    `;
  }
}
