import '@cards/components/horizontal-slider/horizontal-slider';
import { getSliderEntity } from '@delegates/entities/slider-entity';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Renders the horizontal slider when the card config includes a slider entity.
 */
export function renderHorizontalSlider(
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing {
  const slider = getSliderEntity(config);
  if (!slider) {
    return nothing;
  }

  return html`<horizontal-slider
    .hass=${hass}
    .config=${config}
    .slider=${slider}
  ></horizontal-slider>`;
}
