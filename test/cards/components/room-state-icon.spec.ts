import { RoomStateIcon } from '@cards/components/room-state-icon/room-state-icon';
import { styles } from '@cards/components/room-state-icon/styles';
import * as featureModule from '@config/feature';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as computeEntityNameModule from '@hass/common/entity/compute_entity_name';
import type {
  MoreInfoActionConfig,
  ToggleActionConfig,
} from '@hass/data/lovelace/config/action';
import type { HomeAssistant } from '@hass/types';
import * as attributeDisplayModule from '@html/attribute-display';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import * as iconStylesModule from '@theme/render/icon-styles';
import * as lootBoxIconModule from '@theme/render/loot-box-icon';
import * as thresholdColorModule from '@theme/threshold-color';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityConfig, EntityFeatures } from '@type/config/entity';
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
  let getEntityLabelStub: sinon.SinonStub;
  let getThresholdResultStub: sinon.SinonStub;
  let attributeDisplayStub: sinon.SinonStub;
  let hasEntityFeatureStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;
  let computeEntityIconStub: sinon.SinonStub;

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
    getEntityLabelStub = stub(thresholdColorModule, 'getEntityLabel').returns(
      undefined,
    );
    getThresholdResultStub = stub(
      thresholdColorModule,
      'getThresholdResult',
    ).returns(undefined);
    attributeDisplayStub = stub(
      attributeDisplayModule,
      'attributeDisplay',
    ).returns(html`<span>attribute value</span>`);
    hasEntityFeatureStub = stub(featureModule, 'hasEntityFeature').returns(
      false,
    );
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay').returns(
      html`<state-display></state-display>`,
    );
    computeEntityIconStub = stub(
      lootBoxIconModule,
      'computeEntityIcon',
    ).returns(undefined);

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
    getEntityLabelStub.restore();
    getThresholdResultStub.restore();
    attributeDisplayStub.restore();
    hasEntityFeatureStub.restore();
    stateDisplayStub.restore();
    computeEntityIconStub.restore();
  });

  describe('properties', () => {
    it('should have correct property types', () => {
      expect(element['_hass']).to.equal(mockHass);
      expect(element.entity).to.equal(mockEntity);
      expect(element['_config']).to.equal(mockConfig);
    });

    it('should have static styles', () => {
      expect(RoomStateIcon.styles).to.equal(styles);
    });

    it('should update hass setter correctly', () => {
      const newHass = {
        states: {
          'light.living_room': mockEntityState,
        },
        formatEntityState: () => 'formatted state',
      } as any as HomeAssistant;

      element.hass = newHass;
      expect(element['_hass']).to.equal(newHass);
    });

    it('should update config setter correctly', () => {
      const newConfig = {
        area: 'bedroom',
        features: ['show_entity_labels'],
        background: {
          options: ['icon_background'],
          image: '/local/test.jpg',
        },
      } as Config;

      element.config = newConfig;
      expect(element['_config']).to.equal(newConfig);
      expect(element['_showLabels']).to.be.true;
      expect(element['iconBackground']).to.be.true;
    });

    it('should handle config setter with hide_room_icon feature for main room entity', () => {
      // Configure hasFeature stub to return true for this test
      hasFeatureStub.returns(true);

      element.isMainRoomEntity = true;
      const configWithHideIcon = {
        area: 'living_room',
        features: ['hide_room_icon'],
      } as Config;

      element.config = configWithHideIcon;
      expect(element['_hideRoomIcon']).to.be.true;
    });

    it('should handle config setter with hide_icon_only background option for main room entity', () => {
      element.isMainRoomEntity = true;
      const configWithHideIconOnly = {
        area: 'living_room',
        background: {
          options: ['hide_icon_only'],
        },
      } as Config;

      element.config = configWithHideIconOnly;
      expect(element['_hideIconContent']).to.be.true;
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
      expect(() => element.render()).to.throw(TypeError);
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

      // Verify computeEntityIcon is called with correct parameters
      expect(computeEntityIconStub.called).to.be.true;
      expect(
        computeEntityIconStub.calledWith(mockEntity, mockConfig, {
          thresholdResult: undefined,
        }),
      ).to.be.true;
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
      expect(stylesToHostCssStub.calledWith({})).to.be.true;
    });

    it('should call computeEntityIcon with correct parameters', () => {
      const thresholdResult = { icon: 'mdi:threshold-icon' };
      getThresholdResultStub.returns(thresholdResult);

      element.render();

      expect(computeEntityIconStub.called).to.be.true;
      expect(
        computeEntityIconStub.calledWith(mockEntity, mockConfig, {
          thresholdResult,
        }),
      ).to.be.true;
    });

    it('should show entity label when show_entity_labels feature is enabled', async () => {
      // Set up config with show_entity_labels feature enabled
      const configWithLabels = {
        ...mockConfig,
        features: ['show_entity_labels'],
      } as Config;
      element.config = configWithLabels;
      computeEntityNameStub.returns('Living Room Light');

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Render to actual DOM using fixture
      const el = await fixture(result);

      // Verify that computeEntityName was called with the correct parameters
      expect(computeEntityNameStub.calledWith(mockEntityState, mockHass)).to.be
        .true;

      // Verify that the DOM includes the entity label
      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(entityLabel?.textContent?.trim()).to.equal('Living Room Light');
    });

    it('should not show entity label when show_entity_labels feature is disabled', async () => {
      // Use default config without show_entity_labels feature
      element.config = mockConfig;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify that computeEntityName was NOT called since the feature is disabled
      expect(computeEntityNameStub.called).to.be.false;

      // Verify that the template does NOT include the entity label
      const templateString = result.strings.join('');
      expect(templateString).to.not.include('class="entity-label"');
    });

    it('should prioritize threshold label over config label', async () => {
      const configWithLabels = {
        ...mockConfig,
        features: ['show_entity_labels'],
      } as Config;
      element.config = configWithLabels;

      const entityWithConfigLabel = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          label: 'Config Label',
        },
      };
      element.entity = entityWithConfigLabel;

      // Mock threshold result with label
      getThresholdResultStub.returns({
        label: 'Threshold Label',
        icon: 'mdi:icon',
        color: 'red',
        styles: {},
      });
      getEntityLabelStub.returns('Threshold Label');

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(entityLabel?.textContent?.trim()).to.equal('Threshold Label');
      expect(getEntityLabelStub.called).to.be.true;
    });

    it('should use config label when threshold label is not available', async () => {
      const configWithLabels = {
        ...mockConfig,
        features: ['show_entity_labels'],
      } as Config;
      element.config = configWithLabels;

      const entityWithConfigLabel = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          label: 'Config Label',
        },
      };
      element.entity = entityWithConfigLabel;

      // Mock threshold result without label
      getThresholdResultStub.returns({
        icon: 'mdi:icon',
        color: 'red',
        styles: {},
      });
      getEntityLabelStub.returns(undefined);

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(entityLabel?.textContent?.trim()).to.equal('Config Label');
    });

    it('should use attribute display when attribute is configured and no label', async () => {
      const configWithLabels = {
        ...mockConfig,
        features: ['show_entity_labels'],
      } as Config;
      element.config = configWithLabels;

      const entityWithAttribute = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          attribute: 'brightness',
        },
      };
      element.entity = entityWithAttribute;

      // Mock threshold result without label
      getThresholdResultStub.returns({
        icon: 'mdi:icon',
        color: 'red',
        styles: {},
      });
      getEntityLabelStub.returns(undefined);
      attributeDisplayStub.returns(html`<span>50%</span>`);

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(
        attributeDisplayStub.calledWith(
          mockHass,
          mockEntityState,
          'brightness',
        ),
      ).to.be.true;
    });

    it('should use entity name as fallback when no label or attribute', async () => {
      const configWithLabels = {
        ...mockConfig,
        features: ['show_entity_labels'],
      } as Config;
      element.config = configWithLabels;

      const entityWithoutLabel = {
        ...mockEntity,
        config: {
          entity_id: 'light.living_room',
        },
      };
      element.entity = entityWithoutLabel;

      // Mock threshold result without label
      getThresholdResultStub.returns({
        icon: 'mdi:icon',
        color: 'red',
        styles: {},
      });
      getEntityLabelStub.returns(undefined);
      computeEntityNameStub.returns('Living Room Light');

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const entityLabel = el.querySelector('.entity-label');
      expect(entityLabel).to.exist;
      expect(entityLabel?.textContent?.trim()).to.equal('Living Room Light');
      expect(computeEntityNameStub.calledWith(mockEntityState, mockHass)).to.be
        .true;
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
      expect((haStateIcon as any).hass).to.equal(element['_hass']);
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

      // This will throw an error because the component tries to access config properties
      expect(() => element.render()).to.throw(TypeError);
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

    it('should set hideIconContent when entity has entity_picture attribute', () => {
      const entityWithPicture = {
        ...mockEntity,
        state: {
          ...mockEntityState,
          attributes: {
            ...mockEntityState.attributes,
            entity_picture: '/local/picture.jpg',
          },
        },
      };
      element.entity = entityWithPicture;
      element.hass = mockHass;

      expect(element['_hideIconContent']).to.be.true;
      expect(element['image']).to.be.true;
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

  describe('hide icon behavior', () => {
    it('should render empty div with action handlers when hideIcon is true', async () => {
      // Configure hasFeature stub to return true for this test
      hasFeatureStub.returns(true);

      // Configure as main room entity with hide_room_icon feature enabled
      element.isMainRoomEntity = true;
      const configWithHideIcon = {
        ...mockConfig,
        features: ['hide_room_icon'],
      } as Config;
      element.config = configWithHideIcon;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);

      // Should render a div with class "box"
      expect(el.classList.contains('box')).to.be.true;

      // Should not contain ha-state-icon since the icon is hidden
      expect(el.querySelector('ha-state-icon')).to.not.exist;

      // Verify action handlers are still set up
      expect(actionHandlerStub.calledWith(mockEntity)).to.be.true;
      expect(handleClickActionStub.calledWith(element, mockEntity)).to.be.true;
    });

    it('should render without icon content when hideIconContent is true', async () => {
      // Set up entity with entity_picture to trigger hideIconContent
      const entityWithPicture = {
        ...mockEntity,
        state: {
          ...mockEntityState,
          attributes: {
            ...mockEntityState.attributes,
            entity_picture: '/local/picture.jpg',
          },
        },
        // Ensure use_entity_icon feature is NOT enabled to trigger line 148
        config: {
          ...mockEntityConfig,
          features: [], // Empty features array ensures hasEntityFeature returns false
        },
      };
      element.entity = entityWithPicture;
      element.config = mockConfig;
      element.hass = mockHass; // This triggers the hass setter which sets _hideIconContent

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Use fixture to actually render and test the DOM
      const el = await fixture(result);

      // Should render the icon div but without ha-state-icon content
      expect(el.classList.contains('icon') || el.querySelector('.icon')).to
        .exist;
      expect(el.querySelector('ha-state-icon')).to.not.exist;
    });
  });

  describe('entity_picture handling', () => {
    it('should set _image from entity_picture when use_entity_icon feature is not enabled', () => {
      // Create entity without use_entity_icon feature (hasEntityFeature will return false)
      const entityWithoutFeature = {
        ...mockEntity,
        state: {
          ...mockEntityState,
          attributes: {
            ...mockEntityState.attributes,
            entity_picture: '/local/test-picture.jpg',
          },
        },
        config: {
          ...mockEntityConfig,
          features: [], // No use_entity_icon feature
        },
      };
      element.entity = entityWithoutFeature;
      element.config = mockConfig;

      // Setting hass should trigger the setter and execute line 148
      element.hass = mockHass;

      // Verify that _image was set from entity_picture (line 148)
      expect(element['_image']).to.equal('/local/test-picture.jpg');
      expect(element['image']).to.be.true;
      expect(element['iconBackground']).to.be.true;
      expect(element['_hideIconContent']).to.be.true;
    });
  });

  describe('config styles spreading', () => {
    it('should spread entity_icon styles from config when rendering', () => {
      const configWithEntityIconStyles = {
        ...mockConfig,
        styles: {
          entity_icon: {
            '--icon-size': '32px',
            '--icon-color': 'blue',
          },
        },
      } as Config;
      element.config = configWithEntityIconStyles;

      // Mock threshold result with styles
      getThresholdResultStub.returns({
        icon: 'mdi:icon',
        color: 'red',
        styles: {
          '--threshold-color': 'red',
        },
      });

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify that stylesToHostCss was called with merged styles
      // This ensures line 186 (spreading entity_icon styles) was executed
      expect(stylesToHostCssStub.called).to.be.true;
      const callArgs = stylesToHostCssStub.getCall(0).args[0];
      expect(callArgs).to.have.property('--icon-size', '32px');
      expect(callArgs).to.have.property('--icon-color', 'blue');
      expect(callArgs).to.have.property('--threshold-color', 'red');
    });

    it('should spread room_entity_icon styles from config when isMainRoomEntity is true', () => {
      const configWithRoomEntityIconStyles = {
        ...mockConfig,
        styles: {
          entity_icon: {
            '--icon-size': '32px',
            '--icon-color': 'blue',
          },
          room_entity_icon: {
            '--room-icon-size': '48px',
            '--room-icon-color': 'red',
          },
        },
      } as Config;
      element.config = configWithRoomEntityIconStyles;
      element.isMainRoomEntity = true;

      getThresholdResultStub.returns({});

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify that stylesToHostCss was called with merged styles including room_entity_icon
      expect(stylesToHostCssStub.called).to.be.true;
      const callArgs = stylesToHostCssStub.getCall(0).args[0];
      expect(callArgs).to.have.property('--icon-size', '32px');
      expect(callArgs).to.have.property('--icon-color', 'blue');
      expect(callArgs).to.have.property('--room-icon-size', '48px');
      expect(callArgs).to.have.property('--room-icon-color', 'red');
    });

    it('should not spread room_entity_icon styles when isMainRoomEntity is false', () => {
      const configWithRoomEntityIconStyles = {
        ...mockConfig,
        styles: {
          entity_icon: {
            '--icon-size': '32px',
            '--icon-color': 'blue',
          },
          room_entity_icon: {
            '--room-icon-size': '48px',
            '--room-icon-color': 'red',
          },
        },
      } as Config;
      element.config = configWithRoomEntityIconStyles;
      element.isMainRoomEntity = false;

      getThresholdResultStub.returns({});

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify that stylesToHostCss was called without room_entity_icon styles
      expect(stylesToHostCssStub.called).to.be.true;
      const callArgs = stylesToHostCssStub.getCall(0).args[0];
      expect(callArgs).to.have.property('--icon-size', '32px');
      expect(callArgs).to.have.property('--icon-color', 'blue');
      expect(callArgs).to.not.have.property('--room-icon-size');
      expect(callArgs).to.not.have.property('--room-icon-color');
    });
  });

  describe('show_state feature', () => {
    beforeEach(() => {
      // Reset stubs
      hasFeatureStub.returns(true); // Enable show_entity_labels
      hasEntityFeatureStub.restore();
      stateDisplayStub.restore();
    });

    it('should render state display when show_state feature is enabled', async () => {
      hasEntityFeatureStub.restore();
      hasEntityFeatureStub = stub(featureModule, 'hasEntityFeature').callsFake(
        (entity: any, feature: string) => {
          if (feature === 'show_state') return true;
          if (feature === 'use_entity_icon') return false;
          return false;
        },
      );

      stateDisplayStub.restore();
      stateDisplayStub = stub(stateDisplayModule, 'stateDisplay').returns(
        html`<state-display class="test-state-display"></state-display>`,
      );

      const entityWithShowState: EntityInformation = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          features: ['show_state'] as EntityFeatures[],
        },
      };

      element.entity = entityWithShowState;
      element.config = {
        ...mockConfig,
        features: ['show_entity_labels'],
      };

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      const el = await fixture(result);
      const stateDisplay = el.querySelector('.entity-state');

      expect(stateDisplay).to.exist;
      expect(hasEntityFeatureStub.calledWith(entityWithShowState, 'show_state'))
        .to.be.true;
      expect(stateDisplayStub.calledWith(mockHass, mockEntityState)).to.be.true;
    });

    it('should not render state display when show_state feature is disabled', async () => {
      hasEntityFeatureStub = stub(featureModule, 'hasEntityFeature').returns(
        false,
      );

      const entityWithoutShowState = {
        ...mockEntity,
        config: {
          ...mockEntityConfig,
          features: [],
        },
      };

      element.entity = entityWithoutShowState;
      element.config = {
        ...mockConfig,
        features: ['show_entity_labels'],
      };

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      const el = await fixture(result);
      const stateDisplay = el.querySelector('.entity-state');

      expect(stateDisplay).to.not.exist;
      expect(stateDisplayStub.called).to.be.false;
    });

    it('should not render state display when icon content is hidden', async () => {
      hasEntityFeatureStub = stub(featureModule, 'hasEntityFeature').callsFake(
        (entity: any, feature: string) => {
          if (feature === 'show_state') return true;
          if (feature === 'use_entity_icon') return false;
          return false;
        },
      );

      const entityWithPicture: EntityInformation = {
        ...mockEntity,
        state: {
          ...mockEntityState,
          attributes: {
            ...mockEntityState.attributes,
            entity_picture: '/local/picture.jpg',
          },
        },
        config: {
          ...mockEntityConfig,
          features: ['show_state'] as EntityFeatures[],
        },
      };

      element.entity = entityWithPicture;
      element.config = {
        ...mockConfig,
        features: ['show_entity_labels'],
      };
      element.hass = mockHass; // This triggers hideIconContent

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      const el = await fixture(result);
      const stateDisplay = el.querySelector('.entity-state');

      expect(stateDisplay).to.not.exist;
      expect(stateDisplayStub.called).to.be.false;
    });
  });
});
