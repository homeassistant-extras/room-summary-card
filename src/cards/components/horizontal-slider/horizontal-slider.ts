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

import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { SubscribeEntityStateMixin } from '@cards/mixins/subscribe-entity-state-mixin';
import { setBrightness } from '@delegates/actions/brightness-control';
import { getSliderEntity } from '@delegates/entities/slider-entity';
import { setValue } from '@hass/data/input_text';
import { setMediaPlayerVolume } from '@hass/data/media-player';
import type { Config } from '@type/config';
import type { HorizontalSliderStyle } from '@type/config/entity';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';
const equal = require('fast-deep-equal');

@customElement('horizontal-slider')
export class HorizontalSlider extends SubscribeEntityStateMixin(
  HassUpdateMixin(LitElement),
) {
  /**
   * Selected visual style — derived from config in the `config` setter.
   * Reflected as [style] for CSS scoping.
   */
  @property({ type: String, reflect: true, attribute: 'style' })
  private _style: HorizontalSliderStyle | undefined;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  override set config(value: Config) {
    if (equal(value, this.config)) return;

    super.config = value;
    const slider = getSliderEntity(this.config);
    this.entity = slider?.entity_id;
    // only set style if slider is defined as to not affect other components
    this._style = slider ? (slider.slider?.style ?? 'bar') : undefined;
  }

  override get config(): Config {
    return super.config;
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

    if (state.domain === 'media_player') {
      setMediaPlayerVolume(hass, state.entity_id, Number(target.value) / 100);
      return;
    }

    if (state.domain === 'light') {
      setBrightness(hass, state.entity_id, Number(target.value));
      return;
    }

    setValue(hass, state.entity_id, target.value);
  };

  public override render(): TemplateResult | typeof nothing {
    d(this.config, 'horizontal-slider', 'render');
    const s = this.state;
    if (!s) return nothing;

    const rawValue = s ? Number(s.state) : Number.NaN;
    let value = 0;
    let min = Number(s?.attributes.min ?? 0);
    let max = Number(s?.attributes.max ?? 100);
    let step = Number(s?.attributes.step ?? 1);

    if (s.domain === 'media_player') {
      const vol = s.attributes.volume_level;
      value =
        vol == null
          ? 0
          : Math.max(0, Math.min(100, Math.round(Number(vol) * 100)));
    } else if (s.domain === 'light') {
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
