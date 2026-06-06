import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { renderHorizontalSlider } from '@html/render-horizontal-slider';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import { expect } from 'chai';
import { html, nothing } from 'lit';

describe('render-horizontal-slider.ts', () => {
  const state = createStateEntity('input_number', 'brightness', '42', {
    min: 0,
    max: 100,
    step: 1,
  });

  const hass = {
    states: { 'input_number.brightness': state },
  } as any as HomeAssistant;

  const sliderEntity: EntityConfig = {
    entity_id: 'input_number.brightness',
    slider: { style: 'ha' },
  };

  it('renders horizontal-slider with hass, config, and slider entity', async () => {
    const config = {
      area: 'office',
      entities: [sliderEntity],
    } as Config;

    const el = await fixture(
      html`<div>${renderHorizontalSlider(hass, config)}</div>`,
    );

    const slider = el.querySelector('horizontal-slider') as HTMLElement & {
      config?: Config;
      hass?: HomeAssistant;
    };
    expect(slider).to.exist;
    expect(slider.config).to.equal(config);
    expect(slider.hass).to.equal(hass);
  });

  it('returns nothing when no entity has a slider block', () => {
    const result = renderHorizontalSlider(hass, {
      area: 'office',
      entity: { entity_id: 'light.office' },
    } as Config);

    expect(result).to.equal(nothing);
  });
});
