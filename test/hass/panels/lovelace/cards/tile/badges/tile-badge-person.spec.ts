import { renderPersonBadge } from '@hass/panels/lovelace/cards/tile/badges/tile-badge-person';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createState } from '@test/test-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('tile-badge-person.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'zone.living_room': createState('zone', 'living_room', 'living_room', {
          friendly_name: 'Living Room',
          icon: 'mdi:sofa',
        }),
      },
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

  describe('renderPersonBadge', () => {
    it('should render badge with zone icon when person is in a zone', async () => {
      const stateObj = createState('person', 'test', 'living_room', {});
      const result = renderPersonBadge(stateObj, mockHass);
      expect(result).to.not.equal(undefined);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
      expect(el.querySelector('ha-icon')).to.exist;
    });

    it('should render badge with home icon when person is at home', async () => {
      const stateObj = createState('person', 'test', 'home', {});
      const result = renderPersonBadge(stateObj, mockHass);
      expect(result).to.not.equal(undefined);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:home');
    });

    it('should render badge with export icon when person is not home', async () => {
      const stateObj = createState('person', 'test', 'not_home', {});
      const result = renderPersonBadge(stateObj, mockHass);
      expect(result).to.not.equal(undefined);

      const el = await fixture(result as TemplateResult);
      expect(el.tagName.toLowerCase()).to.equal('ha-tile-badge');
      const icon = el.querySelector('ha-icon');
      expect(icon).to.exist;
      expect((icon as any).icon).to.equal('mdi:home-export-outline');
    });
  });
});
