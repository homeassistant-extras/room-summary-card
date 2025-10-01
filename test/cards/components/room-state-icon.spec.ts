import * as featureModule from '@/config/feature';
import { RoomStateIcon } from '@cards/components/room-state-icon/room-state-icon';
import { styles } from '@cards/components/room-state-icon/styles';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as computeEntityNameModule from '@hass/common/entity/compute_entity_name';
import type {
  MoreInfoActionConfig,
  ToggleActionConfig,
} from '@hass/data/lovelace/config/action';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import * as iconStylesModule from '@theme/render/icon-styles';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { stub } from 'sinon';

describe('room-state-icon.ts', () => {
  let element: RoomStateIcon;
  let mockHass: HomeAssistant;
  let renderEntityIconStylesStub: sinon.SinonStub;
  let stylesToHostCssStub: sinon.SinonStub;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;
  let computeEntityNameStub: sinon.SinonStub;

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

  const mockConfig: Config = {
    area: 'living_room',
    styles: {
      entity_icon: {
        '--icon-size': '24px',
      },
    },
  } as Config;

  beforeEach(() => {
    renderEntityIconStylesStub = stub(
      iconStylesModule,
      'renderEntityIconStyles',
    ).returns(
      styleMap({
        '--icon-color': 'var(--primary-color)',
        '--icon-opacity': '1',
      }),
    );
    stylesToHostCssStub = stub(styleConverterModule, 'stylesToHostCss').returns(
      nothing,
    );
    actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns(
      () => {},
    );
    handleClickActionStub = stub(
      actionHandlerModule,
      'handleClickAction',
    ).returns({
      handleEvent: () => {},
    });

    hasFeatureStub = stub(featureModule, 'hasFeature').returns(false);
    computeEntityNameStub = stub(
      computeEntityNameModule,
      'computeEntityName',
    ).returns('Living Room Light');

    mockHass = {
      states: {
        'light.living_room': mockEntityState,
      },
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;

    element = new RoomStateIcon();
    element.hass = mockHass;
    element.entity = mockEntity;
    element.config = mockConfig;
  });

  afterEach(() => {
    renderEntityIconStylesStub.restore();
    stylesToHostCssStub.restore();
    actionHandlerStub.restore();
    handleClickActionStub.restore();
    hasFeatureStub.restore();
    computeEntityNameStub.restore();
  });

  describe('properties', () => {
    it('should have correct property types', () => {
      expect(element.hass).to.equal(mockHass);
      expect(element.entity).to.equal(mockEntity);
      expect(element['_config']).to.equal(mockConfig);
    });

    it('should have static styles', () => {
      expect(RoomStateIcon.styles).to.equal(styles);
    });
  });

  describe('render', () => {
    it('should render nothing when entity state is not available', () => {
      element.entity = {
        ...mockEntity,
        state: undefined,
      };

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render nothing when entity is not set', () => {
      element.entity = undefined as any;

      // This will throw an error because the component tries to destructure state from undefined
      expect(() => element.render()).to.throw();
    });

    it('should render icon when entity state is available', async () => {
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify renderEntityIconStyles is called with correct parameters
      expect(renderEntityIconStylesStub.calledWith(mockHass, mockEntity)).to.be
        .true;

      // Verify stylesToHostCss is called with config styles
      expect(stylesToHostCssStub.calledWith(mockConfig.styles?.entity_icon)).to
        .be.true;

      // Verify action handler functions are called
      expect(actionHandlerStub.calledWith(mockEntity)).to.be.true;
      expect(handleClickActionStub.calledWith(element, mockEntity)).to.be.true;
    });

    it('should render with correct HTML structure', async () => {
      // Ensure the component is not a main room entity
      element.isMainRoomEntity = false;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);

      // The fixture renders our component's template directly
      expect(el.classList.contains('icon')).to.be.true;
      expect(el.querySelector('ha-state-icon')).to.exist;
    });

    it('should handle config without styles', async () => {
      element.config = { area: 'living_room' } as Config;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Should still call stylesToHostCss but with undefined
      expect(stylesToHostCssStub.calledWith(undefined)).to.be.true;
    });

    it('should handle entity without custom icon', async () => {
      const entityWithoutIcon = {
        ...mockEntity,
        config: { entity_id: 'light.living_room' },
      };
      element.entity = entityWithoutIcon;
      element.isMainRoomEntity = false;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);
      expect(
        el.querySelector('ha-state-icon') ||
          el.firstElementChild?.querySelector('ha-state-icon'),
      ).to.exist;
    });

    it('should handle entity with custom icon', async () => {
      const entityWithIcon = {
        ...mockEntity,
        config: { entity_id: 'light.living_room', icon: 'mdi:custom-icon' },
      };
      element.entity = entityWithIcon;
      element.isMainRoomEntity = false;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);
      expect(
        el.querySelector('ha-state-icon') ||
          el.firstElementChild?.querySelector('ha-state-icon'),
      ).to.exist;
    });

    it('should show entity label when show_entity_labels feature is enabled', async () => {
      // Reset and configure the hasFeature stub for this test
      hasFeatureStub.restore();
      hasFeatureStub = stub(featureModule, 'hasFeature').returns(true);
      computeEntityNameStub.returns('Living Room Light');

      // Test the component instance directly
      element.entity = mockEntity;
      element.hass = mockHass;
      element.config = mockConfig;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Render to actual DOM using fixture
      const el = await fixture(result);

      // Verify that hasFeature was called with the correct parameters
      expect(hasFeatureStub.calledWith(mockConfig, 'show_entity_labels')).to.be
        .true;

      // Verify that computeEntityName was called with the correct parameters
      expect(computeEntityNameStub.calledWith(mockEntityState, mockHass)).to.be
        .true;

      // Verify that the DOM includes the entity label
      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(entityLabel?.textContent?.trim()).to.equal('Living Room Light');
    });

    it('should not show entity label when show_entity_labels feature is disabled', async () => {
      // Disable the show_entity_labels feature (default behavior)
      hasFeatureStub.withArgs(mockConfig, 'show_entity_labels').returns(false);

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify that hasFeature was called with the correct parameters
      expect(hasFeatureStub.calledWith(mockConfig, 'show_entity_labels')).to.be
        .true;

      // Verify that computeEntityName was NOT called since the feature is disabled
      expect(computeEntityNameStub.called).to.be.false;

      // Verify that the template does NOT include the entity label
      const templateString = result.strings.join('');
      expect(templateString).to.not.include('class="entity-label"');
    });
  });

  describe('action handling', () => {
    it('should set up action handler correctly', () => {
      element.render();

      expect(actionHandlerStub.calledWith(mockEntity)).to.be.true;
      expect(handleClickActionStub.calledWith(element, mockEntity)).to.be.true;
    });

    it('should handle different entity configurations', () => {
      const entityWithActions = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          tap_action: { action: 'toggle' } as ToggleActionConfig,
          hold_action: { action: 'more-info' } as MoreInfoActionConfig,
        },
      };
      element.entity = entityWithActions;

      element.render();

      expect(actionHandlerStub.calledWith(entityWithActions)).to.be.true;
      expect(handleClickActionStub.calledWith(element, entityWithActions)).to.be
        .true;
    });
  });

  describe('styling', () => {
    it('should apply icon styles from renderEntityIconStyles', () => {
      const mockIconStyle = html`<style>
        --icon-color: var(--primary-color);
        --icon-opacity: 1;
      </style>`;
      renderEntityIconStylesStub.returns(mockIconStyle);

      element.render();

      expect(renderEntityIconStylesStub.calledWith(mockHass, mockEntity)).to.be
        .true;
    });

    it('should apply config styles via stylesToHostCss', () => {
      const customConfig = {
        ...mockConfig,
        styles: {
          entity_icon: {
            '--custom-property': 'value',
          },
        },
      };
      element.config = customConfig;

      element.render();

      expect(stylesToHostCssStub.calledWith(customConfig.styles?.entity_icon))
        .to.be.true;
    });

    it('should handle renderEntityIconStyles returning nothing', () => {
      renderEntityIconStylesStub.returns(nothing);

      const result = element.render();
      expect(result).to.not.equal(nothing);

      expect(renderEntityIconStylesStub.calledWith(mockHass, mockEntity)).to.be
        .true;
    });
  });

  describe('integration with Home Assistant', () => {
    it('should pass hass instance to ha-state-icon', async () => {
      element.isMainRoomEntity = false;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);
      const haStateIcon =
        el.querySelector('ha-state-icon') ||
        el.firstElementChild?.querySelector('ha-state-icon');
      expect(haStateIcon).to.exist;
      expect((haStateIcon as any).hass).to.equal(element.hass);
    });

    it('should pass state object to ha-state-icon', async () => {
      element.isMainRoomEntity = false;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);
      const haStateIcon =
        el.querySelector('ha-state-icon') ||
        el.firstElementChild?.querySelector('ha-state-icon');
      expect(haStateIcon).to.exist;
      expect((haStateIcon as any).stateObj).to.equal(element.entity.state);
    });

    it('should handle different entity states', () => {
      const offState = createStateEntity('light', 'living_room', 'off', {
        friendly_name: 'Living Room Light',
      });
      const entityWithOffState = {
        ...mockEntity,
        state: offState,
      };
      element.entity = entityWithOffState;

      const result = element.render();
      expect(result).to.not.equal(nothing);

      expect(
        renderEntityIconStylesStub.calledWith(mockHass, entityWithOffState),
      ).to.be.true;
    });
  });

  describe('edge cases', () => {
    it('should handle entity with empty state attributes', () => {
      const entityWithEmptyAttributes = {
        ...mockEntity,
        state: {
          ...mockEntityState,
          attributes: {},
        },
      };
      element.entity = entityWithEmptyAttributes;

      const result = element.render();
      expect(result).to.not.equal(nothing);
    });

    it('should handle entity with null config', () => {
      const entityWithNullConfig = {
        ...mockEntity,
        config: null as any,
      };
      element.entity = entityWithNullConfig;

      // This will throw an error because the component tries to access config.icon
      expect(() => element.render()).to.throw();
    });

    it('should handle undefined hass', () => {
      element.hass = undefined as any;

      const result = element.render();
      expect(result).to.not.equal(nothing); // Should still render, just may not work properly
    });
  });

  describe('background image configuration', () => {
    it('should set iconBackground property when config has icon_background option', () => {
      element.config = {
        area: 'living_room',
        background: {
          options: ['icon_background'],
          image: '/local/test.jpg',
        },
      } as Config;

      expect(element['iconBackground']).to.be.true;
    });

    it('should not set iconBackground property when config has no icon_background option', () => {
      element.config = {
        area: 'living_room',
        background: {
          image: '/local/test.jpg',
        },
      } as Config;

      expect(element['iconBackground']).to.be.false;
    });
  });
});
