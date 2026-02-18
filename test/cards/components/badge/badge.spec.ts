import { Badge } from '@cards/components/badge/badge';
import { styles } from '@cards/components/badge/styles';
import * as badgeStateModule from '@delegates/utils/badge-state';
import * as renderTileBadgeModule from '@hass/panels/lovelace/cards/tile/badges/tile-badge';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import * as styleConverterModule from '@theme/util/style-converter';
import type { BadgeConfig, StateConfig } from '@type/config/entity';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('badge.ts', () => {
  let element: Badge;
  let mockHass: HomeAssistant;
  let mockEntityState: EntityState;
  let getMatchingBadgeStateStub: sinon.SinonStub;
  let renderTileBadgeStub: sinon.SinonStub;
  let stylesToHostCssStub: sinon.SinonStub;

  const mockBadgeConfig: BadgeConfig = {
    entity_id: 'light.living_room',
    position: 'top_right',
    mode: 'show_always',
  };

  beforeEach(() => {
    mockEntityState = createStateEntity('light', 'living_room', 'on', {
      friendly_name: 'Living Room Light',
    });

    getMatchingBadgeStateStub = stub(
      badgeStateModule,
      'getMatchingBadgeState',
    ).returns(undefined);
    renderTileBadgeStub = stub(
      renderTileBadgeModule,
      'renderTileBadge',
    ).returns(html`<ha-tile-badge>Test Badge</ha-tile-badge>`);
    stylesToHostCssStub = stub(styleConverterModule, 'stylesToHostCss').returns(
      nothing,
    );

    mockHass = {
      states: {
        'light.living_room': mockEntityState,
      },
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;

    element = new Badge();
    element.config = mockBadgeConfig;
    element.hass = mockHass;
    // Badge gets state from SubscribeEntityStateMixin; set directly for unit tests
    element['_subscribedEntityState'] = mockEntityState;
  });

  afterEach(() => {
    getMatchingBadgeStateStub.restore();
    renderTileBadgeStub.restore();
    stylesToHostCssStub.restore();
  });

  describe('config and properties', () => {
    it('should store config and set position from config', () => {
      expect(element['_config']).to.equal(mockBadgeConfig);
      expect(element.position).to.equal('top-right');
    });

    it('should have static styles', () => {
      expect(Badge.styles).to.equal(styles);
    });

    it('should default position to top-right', () => {
      const newElement = new Badge();
      expect(newElement.position).to.equal('top-right');
    });

    it('should set entityId from config.entity_id', () => {
      element.config = { ...mockBadgeConfig, entity_id: 'sensor.temp' };
      expect(element['entityId']).to.equal('sensor.temp');
    });

    it('should convert position underscores to hyphens', () => {
      element.config = { ...mockBadgeConfig, position: 'top_left' };
      expect(element.position).to.equal('top-left');
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.hass = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    it('should render nothing when _subscribedEntityState is not set', () => {
      element['_subscribedEntityState'] = undefined;
      expect(element.render()).to.equal(nothing);
    });

    describe('homeassistant mode', () => {
      it('should use renderTileBadge when mode is homeassistant', () => {
        element.config = { ...mockBadgeConfig, mode: 'homeassistant' };

        const result = element.render();
        expect(result).to.not.equal(nothing);
        expect(renderTileBadgeStub.calledWith(mockEntityState, mockHass)).to.be
          .true;
      });

      it('should not call getMatchingBadgeState in homeassistant mode', () => {
        element.config = { ...mockBadgeConfig, mode: 'homeassistant' };
        element.render();
        expect(getMatchingBadgeStateStub.called).to.be.false;
      });
    });

    describe('if_match mode', () => {
      it('should render nothing when no matching state is found', () => {
        getMatchingBadgeStateStub.returns(undefined);
        element.config = { ...mockBadgeConfig, mode: 'if_match' };

        const result = element.render();
        expect(result).to.equal(nothing);
        expect(
          getMatchingBadgeStateStub.calledWith(
            mockEntityState,
            element['_config'],
          ),
        ).to.be.true;
      });

      it('should render badge when matching state is found', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'if_match' };

        const result = element.render();
        expect(result).to.not.equal(nothing);
      });
    });

    describe('show_always mode', () => {
      it('should render badge even when no matching state', () => {
        getMatchingBadgeStateStub.returns(undefined);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        const result = element.render();
        expect(result).to.not.equal(nothing);
      });

      it('should render badge with matching state when found', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        const result = element.render();
        expect(result).to.not.equal(nothing);
      });
    });

    describe('badge rendering', () => {
      it('should render ha-tile-badge with icon_color from matching state', async () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        const tileBadge = (
          el.tagName.toLowerCase() === 'ha-tile-badge'
            ? el
            : el.querySelector('ha-tile-badge')
        ) as HTMLElement;
        expect(tileBadge).to.exist;
        expect(
          tileBadge?.style.getPropertyValue('--tile-badge-background-color'),
        ).to.equal('yellow');
      });

      it('should render ha-state-icon with correct properties', async () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        const stateIcon = el.querySelector('ha-state-icon');
        expect(stateIcon).to.exist;
        expect((stateIcon as any).hass).to.equal(mockHass);
        expect((stateIcon as any).stateObj).to.equal(mockEntityState);
        expect((stateIcon as any).icon).to.equal('mdi:light-on');
      });
    });

    describe('styles handling', () => {
      it('should call stylesToHostCss when matching state has styles', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
          styles: { '--custom-property': 'value' },
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        element.render();

        expect(stylesToHostCssStub.calledWith(matchingState.styles)).to.be.true;
      });

      it('should not call stylesToHostCss when matching state has no styles', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
        };
        getMatchingBadgeStateStub.returns(matchingState);
        element.config = { ...mockBadgeConfig, mode: 'show_always' };

        element.render();

        expect(stylesToHostCssStub.called).to.be.false;
      });
    });
  });

  describe('getMatchingBadgeState integration', () => {
    it('should call getMatchingBadgeState with state and config', () => {
      element.config = { ...mockBadgeConfig, mode: 'show_always' };
      element.render();

      expect(
        getMatchingBadgeStateStub.calledWith(
          mockEntityState,
          element['_config'],
        ),
      ).to.be.true;
    });
  });
});
