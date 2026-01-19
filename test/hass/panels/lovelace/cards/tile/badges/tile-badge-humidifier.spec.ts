import { renderHumidifierBadge } from '@hass/panels/lovelace/cards/tile/badges/tile-badge-humidifier';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createState } from '@test/test-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';

describe('tile-badge-humidifier.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {},
      entities: {},
      devices: {},
      areas: {},
      themes: {},
      localize: () => '',
      language: 'en',
      callService: async () => ({}),
      callWS: async () => ({}),
      formatEntityState: () => '',
    } as any as HomeAssistant;
  });

  describe('renderHumidifierBadge', () => {
    it('should return nothing when action is off', () => {
      const stateObj = createState('humidifier', 'test', 'on', {
        action: 'off',
      });
      const result = renderHumidifierBadge(stateObj, mockHass);
      expect(result).to.equal(nothing);
    });

    it('should return nothing when action is undefined', () => {
      const stateObj = createState('humidifier', 'test', 'on', {});
      const result = renderHumidifierBadge(stateObj, mockHass);
      expect(result).to.equal(nothing);
    });

    it('should render badge when action is humidifying', async () => {
      const stateObj = createState('humidifier', 'test', 'on', {
        action: 'humidifying',
      });
      const result = renderHumidifierBadge(stateObj, mockHass);
      expect(result).to.not.equal(nothing);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
      expect(el.querySelector('ha-attribute-icon')).to.exist;
    });

    it('should render badge when action is drying', async () => {
      const stateObj = createState('humidifier', 'test', 'on', {
        action: 'drying',
      });
      const result = renderHumidifierBadge(stateObj, mockHass);
      expect(result).to.not.equal(nothing);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
    });
  });
});
