import { Badge } from '@cards/components/badge/badge';
import { styles } from '@cards/components/badge/styles';
import * as stateRetrieverModule from '@delegates/retrievers/state';
import * as badgeStateModule from '@delegates/utils/badge-state';
import * as renderTileBadgeModule from '@hass/panels/lovelace/cards/tile/badges/tile-badge';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import * as styleConverterModule from '@theme/util/style-converter';
import type {
  BadgeConfig,
  EntityConfig,
  StateConfig,
} from '@type/config/entity';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('badge.ts', () => {
  let element: Badge;
  let mockHass: HomeAssistant;
  let getStateStub: sinon.SinonStub;
  let getMatchingBadgeStateStub: sinon.SinonStub;
  let renderTileBadgeStub: sinon.SinonStub;
  let stylesToHostCssStub: sinon.SinonStub;

  const mockEntityState: EntityState = createStateEntity(
    'light',
    'living_room',
    'on',
    {
      friendly_name: 'Living Room Light',
    },
  );

  const mockEntityConfig: EntityConfig = {
    entity_id: 'light.living_room',
    icon: 'mdi:lightbulb',
  };

  const mockEntity: EntityInformation = {
    config: mockEntityConfig,
    state: mockEntityState,
  };

  const mockBadgeConfig: BadgeConfig = {
    position: 'top_right',
    mode: 'show_always',
  };

  beforeEach(() => {
    // Register custom element if not already registered
    if (!customElements.get('room-summary-badge')) {
      customElements.define('room-summary-badge', Badge);
    }

    getStateStub = stub(stateRetrieverModule, 'getState').returns(
      mockEntityState,
    );
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
    element.entity = mockEntity;
  });

  afterEach(() => {
    getStateStub.restore();
    getMatchingBadgeStateStub.restore();
    renderTileBadgeStub.restore();
    stylesToHostCssStub.restore();
  });

  describe('properties', () => {
    it('should have correct property types', () => {
      expect(element.config).to.equal(mockBadgeConfig);
      expect(element.entity).to.equal(mockEntity);
      expect(element.position).to.equal('top-right');
    });

    it('should have static styles', () => {
      expect(Badge.styles).to.equal(styles);
    });

    it('should default position to top-right', () => {
      const newElement = new Badge();
      expect(newElement.position).to.equal('top-right');
    });
  });

  describe('hass setter', () => {
    it('should set internal hass and update entity', () => {
      element.hass = mockHass;

      expect(element['_hass']).to.equal(mockHass);
      expect(element['_entity']).to.exist;
      expect(element['_entity']?.config).to.equal(mockEntityConfig);
      expect(element['_entity']?.state).to.equal(mockEntityState);
    });

    it('should use parent entity when config.entity_id is not set', () => {
      element.config = {
        ...mockBadgeConfig,
        entity_id: undefined,
      };
      element.hass = mockHass;

      expect(getStateStub.called).to.be.false;
      expect(element['_entity']?.state).to.equal(mockEntityState);
    });

    it('should use config.entity_id when set', () => {
      const otherEntityState = createStateEntity(
        'sensor',
        'temperature',
        '25',
        {
          unit_of_measurement: '°C',
        },
      );
      getStateStub.returns(otherEntityState);

      element.config = {
        ...mockBadgeConfig,
        entity_id: 'sensor.temperature',
      };
      element.hass = mockHass;

      expect(getStateStub.calledWith(mockHass.states, 'sensor.temperature')).to
        .be.true;
      expect(element['_entity']?.state).to.equal(otherEntityState);
      expect(element['_entity']?.config).to.equal(mockEntityConfig);
    });

    it('should convert position underscores to hyphens', () => {
      element.config = {
        ...mockBadgeConfig,
        position: 'top_left',
      };
      element.hass = mockHass;

      expect(element.position).to.equal('top-left');
    });

    it('should default to top_right position when not specified', () => {
      element.config = {
        mode: 'show_always',
      };
      element.hass = mockHass;

      expect(element.position).to.equal('top-right');
    });

    it('should handle all position values', () => {
      const positions: Array<
        'top_right' | 'top_left' | 'bottom_right' | 'bottom_left'
      > = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];

      positions.forEach((pos) => {
        element.config = {
          ...mockBadgeConfig,
          position: pos,
        };
        element.hass = mockHass;
        expect(element.position).to.equal(pos.replace(/_/g, '-'));
      });
    });
  });

  describe('render', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should render nothing when entity is not set', () => {
      element['_entity'] = undefined;
      expect(element.render()).to.equal(nothing);
    });

    it('should render nothing when hass is not set', () => {
      element['_hass'] = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    describe('homeassistant mode', () => {
      it('should use renderTileBadge when mode is homeassistant', () => {
        element.config = {
          ...mockBadgeConfig,
          mode: 'homeassistant',
        };
        element.hass = mockHass;

        const result = element.render();
        expect(result).to.not.equal(nothing);
        expect(renderTileBadgeStub.called).to.be.true;
        expect(renderTileBadgeStub.calledWith(mockEntityState, mockHass)).to.be
          .true;
      });

      it('should not call getMatchingBadgeState in homeassistant mode', () => {
        element.config = {
          ...mockBadgeConfig,
          mode: 'homeassistant',
        };
        element.hass = mockHass;

        element.render();
        expect(getMatchingBadgeStateStub.called).to.be.false;
      });
    });

    describe('if_match mode', () => {
      it('should render nothing when no matching state is found', () => {
        getMatchingBadgeStateStub.returns(undefined);
        element.config = {
          ...mockBadgeConfig,
          mode: 'if_match',
        };
        element.hass = mockHass;

        const result = element.render();
        expect(result).to.equal(nothing);
        expect(getMatchingBadgeStateStub.called).to.be.true;
      });

      it('should render badge when matching state is found', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'if_match',
        };
        element.hass = mockHass;

        const result = element.render();
        expect(result).to.not.equal(nothing);
        expect(getMatchingBadgeStateStub.called).to.be.true;
      });
    });

    describe('show_always mode', () => {
      it('should render badge even when no matching state', () => {
        getMatchingBadgeStateStub.returns(undefined);
        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

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

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render();
        expect(result).to.not.equal(nothing);
      });
    });

    describe('default mode (show_always)', () => {
      it('should render badge when mode is not specified', () => {
        element.config = {
          position: 'top_right',
        };
        element.hass = mockHass;

        const result = element.render();
        expect(result).to.not.equal(nothing);
      });
    });

    describe('badge rendering', () => {
      it('should render ha-tile-badge with correct properties', async () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        // fixture() may return the root element or wrap it in a container
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

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        const stateIcon = el.querySelector('ha-state-icon');
        expect(stateIcon).to.exist;
        expect((stateIcon as any).hass).to.equal(mockHass);
        expect((stateIcon as any).stateObj).to.equal(mockEntityState);
        expect((stateIcon as any).icon).to.equal('mdi:light-on');
      });

      it('should use entity config icon when matching state has no icon', async () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        const stateIcon = el.querySelector('ha-state-icon');
        expect((stateIcon as any).icon).to.equal('mdi:lightbulb');
      });

      it('should use entity config icon when no matching state', async () => {
        getMatchingBadgeStateStub.returns(undefined);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        const stateIcon = el.querySelector('ha-state-icon');
        expect((stateIcon as any).icon).to.equal('mdi:lightbulb');
      });
    });

    describe('styles handling', () => {
      it('should call stylesToHostCss when matching state has styles', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
          icon: 'mdi:light-on',
          styles: {
            '--custom-property': 'value',
          },
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        element.render();

        expect(stylesToHostCssStub.called).to.be.true;
        expect(stylesToHostCssStub.calledWith(matchingState.styles)).to.be.true;
      });

      it('should not call stylesToHostCss when matching state has no styles', () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'yellow',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        element.render();

        expect(stylesToHostCssStub.called).to.be.false;
      });

      it('should not call stylesToHostCss when no matching state', () => {
        getMatchingBadgeStateStub.returns(undefined);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        element.render();

        expect(stylesToHostCssStub.called).to.be.false;
      });
    });

    describe('icon color handling', () => {
      it('should set background color from matching state', async () => {
        const matchingState: StateConfig = {
          state: 'on',
          icon_color: 'red',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        // fixture() may return the root element or wrap it in a container
        const tileBadge = (
          el.tagName.toLowerCase() === 'ha-tile-badge'
            ? el
            : el.querySelector('ha-tile-badge')
        ) as HTMLElement;
        expect(
          tileBadge?.style.getPropertyValue('--tile-badge-background-color'),
        ).to.equal('red');
      });

      it('should handle undefined icon_color gracefully', async () => {
        const matchingState: StateConfig = {
          state: 'on',
        };
        getMatchingBadgeStateStub.returns(matchingState);

        element.config = {
          ...mockBadgeConfig,
          mode: 'show_always',
        };
        element.hass = mockHass;

        const result = element.render() as TemplateResult;
        const el = await fixture(result);

        // fixture() may return the root element or wrap it in a container
        const tileBadge =
          el.tagName.toLowerCase() === 'ha-tile-badge'
            ? el
            : el.querySelector('ha-tile-badge');
        expect(tileBadge).to.exist;
        // Should still render even without icon_color
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should handle entity with undefined state', () => {
      element.entity = {
        ...mockEntity,
        state: undefined,
      };
      element.hass = mockHass;

      // Should still set _entity but render will return nothing
      expect(element['_entity']?.state).to.be.undefined;
      expect(element.render()).to.equal(nothing);
    });

    it('should handle config without mode', () => {
      element.config = {
        position: 'top_right',
      };
      element.hass = mockHass;

      const result = element.render();
      expect(result).to.not.equal(nothing);
    });

    it('should handle config without position', () => {
      element.config = {
        mode: 'show_always',
      };
      element.hass = mockHass;

      expect(element.position).to.equal('top-right');
      const result = element.render();
      expect(result).to.not.equal(nothing);
    });

    it('should handle entity config without icon', () => {
      const entityWithoutIcon: EntityInformation = {
        config: {
          entity_id: 'light.living_room',
        },
        state: mockEntityState,
      };
      element.entity = entityWithoutIcon;
      element.hass = mockHass;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle getState returning undefined for custom entity_id', () => {
      getStateStub.returns(undefined);

      element.config = {
        ...mockBadgeConfig,
        entity_id: 'sensor.nonexistent',
      };
      element.hass = mockHass;

      // Should use undefined state from getState
      expect(element['_entity']?.state).to.be.undefined;
      expect(element.render()).to.equal(nothing);
    });
  });

  describe('integration', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should call getMatchingBadgeState with correct parameters', () => {
      element.config = {
        ...mockBadgeConfig,
        mode: 'show_always',
      };
      element.hass = mockHass;

      element.render();

      expect(getMatchingBadgeStateStub.called).to.be.true;
      expect(
        getMatchingBadgeStateStub.calledWith(
          element['_entity'],
          mockBadgeConfig,
        ),
      ).to.be.true;
    });

    it('should use custom entity when config.entity_id is set', () => {
      const customEntityState = createStateEntity(
        'sensor',
        'temperature',
        '25',
      );
      getStateStub.returns(customEntityState);

      element.config = {
        ...mockBadgeConfig,
        entity_id: 'sensor.temperature',
      };
      element.hass = mockHass;

      element.render();

      expect(
        getMatchingBadgeStateStub.calledWith(
          {
            config: mockEntityConfig,
            state: customEntityState,
          },
          element.config,
        ),
      ).to.be.true;
    });
  });
});
