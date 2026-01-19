import { renderClimateBadge } from '@hass/panels/lovelace/cards/tile/badges/tile-badge-climate';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createState } from '@test/test-helpers';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';

describe('tile-badge-climate.ts', () => {
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

  describe('renderClimateBadge', () => {
    it('should return nothing when hvac_action is off', () => {
      const stateObj = createState('climate', 'test', 'heat', {
        hvac_action: 'off',
      });
      const result = renderClimateBadge(stateObj, mockHass);
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hvac_action is undefined', () => {
      const stateObj = createState('climate', 'test', 'heat', {});
      const result = renderClimateBadge(stateObj, mockHass);
      expect(result).to.equal(nothing);
    });

    it('should render badge when hvac_action is heating', async () => {
      const stateObj = createState('climate', 'test', 'heat', {
        hvac_action: 'heating',
      });
      const result = renderClimateBadge(stateObj, mockHass);
      expect(result).to.not.equal(nothing);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
      expect(el.querySelector('ha-attribute-icon')).to.exist;
    });

    it('should render badge when hvac_action is cooling', async () => {
      const stateObj = createState('climate', 'test', 'cool', {
        hvac_action: 'cooling',
      });
      const result = renderClimateBadge(stateObj, mockHass);
      expect(result).to.not.equal(nothing);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
    });
  });
});
