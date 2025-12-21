import { RoomSummaryCard } from '@cards/card';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as setupCardModule from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { styles } from '@theme/styles';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { createState as s } from '../test-helpers';

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: HomeAssistant;
  let actionHandlerStub: sinon.SinonStub;
  let getRoomPropertiesStub: sinon.SinonStub;

  beforeEach(() => {
    actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
      bind: () => {},
      handleAction: () => {},
    });
    getRoomPropertiesStub = stub(setupCardModule, 'getRoomProperties').returns({
      roomInfo: { area_name: 'Living Room' },
      roomEntity: {
        config: { entity_id: 'light.test' },
        state: {
          entity_id: 'light.test',
          state: 'on',
          attributes: {},
          domain: 'light',
        },
      },
      sensors: {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      },
      image: Promise.resolve(null),
      isActive: true,
      isIconActive: true,
      thresholds: {
        hot: false,
        humid: false,
        hotColor: undefined,
        humidColor: undefined,
      },
      flags: {
        occupied: true,
        smoke: false,
        dark: true,
      },
    });
    card = new RoomSummaryCard();
    mockHass = {
      states: {
        'light.living_room': s('light', 'living_room', 'on'),
        'switch.living_room_fan': s('switch', 'living_room_fan', 'off'),
      },
      devices: {
        device_1: { area_id: 'living_room' },
        device_2: { area_id: 'living_room' },
      },
      entities: {
        'light.living_room': {
          device_id: 'device_1',
          area_id: 'living_room',
          labels: [],
        },
        'switch.living_room_fan': {
          device_id: 'device_2',
          area_id: 'living_room',
          labels: [],
        },
      },
      areas: {
        living_room: { area_id: 'living_room', icon: '' },
        bedroom: { area_id: 'bedroom', icon: '' },
      },
      themes: { darkMode: true, theme: 'default' },
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;
    card.setConfig({ area: 'living_room' });
    card.hass = mockHass;
  });

  afterEach(() => {
    actionHandlerStub.restore();
    getRoomPropertiesStub.restore();
  });

  describe('setConfig', () => {
    it('should set the config', () => {
      const config = { area: 'living_room' };
      card.setConfig(config);
      expect(card['_config']).to.deep.equal(config);
    });
  });

  describe('hass property setter', () => {
    it('should update internal state and flags from getRoomProperties', () => {
      expect(card['_roomEntity']).to.exist;
      expect(card['_sensors']).to.exist;
      expect(card['_roomInformation']).to.exist;
      expect(card['dark']).to.be.true; // Since mockHass has darkMode: true
      expect(card['occupied']).to.be.true; // Should be set based on occupancy state
    });

    it('should update _hass when formatEntityState changes', () => {
      const newHass = {
        ...mockHass,
        formatEntityState: () => 'new formatted state',
      } as any as HomeAssistant;

      card.hass = newHass;
      expect(card['_hass']).to.equal(newHass);
    });

    it('should set _isActive based on getRoomProperties result', () => {
      // Test with isActive: true from mock
      expect(card['_isActive']).to.be.true;

      // Update mock to return isActive: false
      getRoomPropertiesStub.returns({
        roomInfo: { area_name: 'Living Room' },
        roomEntity: {
          config: { entity_id: 'light.test' },
          state: {
            entity_id: 'light.test',
            state: 'off',
            attributes: {},
            domain: 'light',
          },
        },
        sensors: {
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],
        },
        image: Promise.resolve(null),
        isActive: false,
        thresholds: {
          hot: false,
          humid: false,
          hotColor: undefined,
          humidColor: undefined,
        },
        flags: {
          occupied: false,
          dark: false,
        },
      });

      card.hass = mockHass;
      expect(card['_isActive']).to.be.false;
    });

    it('should handle image promise and update _image when resolved', async () => {
      getRoomPropertiesStub.returns({
        roomInfo: { area_name: 'Living Room' },
        roomEntity: {
          config: { entity_id: 'light.test' },
          state: {
            entity_id: 'light.test',
            state: 'on',
            attributes: {},
            domain: 'light',
          },
        },
        sensors: {
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],
        },
        image: Promise.resolve('/local/test.jpg'),
        isActive: true,
        thresholds: {
          hot: false,
          humid: false,
          hotColor: undefined,
          humidColor: undefined,
        },
        flags: {
          occupied: true,
          dark: true,
        },
      });

      card.hass = mockHass;
      // Wait for image promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.true;
    });

    it('should not set image property when iconBackground is set', async () => {
      card.setConfig({
        area: 'living_room',
        background: {
          options: ['icon_background'],
          image: '/local/test.jpg',
        },
      });

      getRoomPropertiesStub.returns({
        roomInfo: { area_name: 'Living Room' },
        roomEntity: {
          config: { entity_id: 'light.test' },
          state: {
            entity_id: 'light.test',
            state: 'on',
            attributes: {},
            domain: 'light',
          },
        },
        sensors: {
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],
        },
        image: Promise.resolve('/local/test.jpg'),
        isActive: true,
        thresholds: {
          hot: false,
          humid: false,
          hotColor: undefined,
          humidColor: undefined,
        },
        flags: {
          occupied: true,
          dark: true,
        },
      });

      card.hass = mockHass;
      // Wait for image promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.false; // Should be false when iconBackground is set
      expect(card['iconBackground']).to.be.true;
    });

    it('should set image property when iconBackground is not set', async () => {
      card.setConfig({
        area: 'living_room',
        background: {
          image: '/local/test.jpg',
        },
      });

      getRoomPropertiesStub.returns({
        roomInfo: { area_name: 'Living Room' },
        roomEntity: {
          config: { entity_id: 'light.test' },
          state: {
            entity_id: 'light.test',
            state: 'on',
            attributes: {},
            domain: 'light',
          },
        },
        sensors: {
          individual: [],
          averaged: [],
          problemSensors: [],
          lightEntities: [],
          thresholdSensors: [],
        },
        image: Promise.resolve('/local/test.jpg'),
        isActive: true,
        thresholds: {
          hot: false,
          humid: false,
          hotColor: undefined,
          humidColor: undefined,
        },
        flags: {
          occupied: true,
          dark: true,
        },
      });

      card.hass = mockHass;
      // Wait for image promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.true; // Should be true when iconBackground is not set
      expect(card['iconBackground']).to.be.false;
    });

    it('should detect Frosted Glass theme and set frostedGlass property', () => {
      const frostedHass = {
        ...mockHass,
        themes: { darkMode: false, theme: 'Frosted Glass' },
      } as any as HomeAssistant;

      card.hass = frostedHass;
      expect(card['frostedGlass']).to.be.true;
    });

    it('should detect Frosted Glass Lite theme and set frostedGlass property', () => {
      const frostedLiteHass = {
        ...mockHass,
        themes: { darkMode: false, theme: 'Frosted Glass Lite' },
      } as any as HomeAssistant;

      card.hass = frostedLiteHass;
      expect(card['frostedGlass']).to.be.true;
    });

    it('should not set frostedGlass property for non-Frosted Glass themes', () => {
      const defaultHass = {
        ...mockHass,
        themes: { darkMode: false, theme: 'default' },
      } as any as HomeAssistant;

      card.hass = defaultHass;
      expect(card['frostedGlass']).to.be.false;
    });

    it('should not set frostedGlass property when theme is undefined', () => {
      const undefinedThemeHass = {
        ...mockHass,
        themes: { darkMode: false, theme: undefined },
      } as any as HomeAssistant;

      card.hass = undefinedThemeHass;
      expect(card['frostedGlass']).to.be.false;
    });

    it('should update frostedGlass property when theme changes', () => {
      // Start with default theme
      const defaultHass = {
        ...mockHass,
        themes: { darkMode: false, theme: 'default' },
      } as any as HomeAssistant;

      card.hass = defaultHass;
      expect(card['frostedGlass']).to.be.false;

      // Switch to Frosted Glass theme
      const frostedHass = {
        ...mockHass,
        themes: { darkMode: false, theme: 'Frosted Glass' },
      } as any as HomeAssistant;

      card.hass = frostedHass;
      expect(card['frostedGlass']).to.be.true;
    });

    it('should set iconOpacityPreset property from config', () => {
      card.setConfig({
        area: 'living_room',
        icon_opacity_preset: 'high_visibility',
      });
      card.hass = mockHass;
      expect(card['iconOpacityPreset']).to.equal('high_visibility');
    });

    it('should set iconOpacityPreset to undefined when not in config', () => {
      card.setConfig({
        area: 'living_room',
      });
      card.hass = mockHass;
      expect(card['iconOpacityPreset']).to.be.undefined;
    });
  });

  describe('styles', () => {
    it('should return expected styles', () => {
      expect(RoomSummaryCard.styles).to.deep.equal(styles);
    });
  });

  describe('rendering', () => {
    it('should render nothing if no hass', () => {
      (card as any)._hass = undefined;
      expect(card.render()).to.equal(nothing);
    });

    it('should render the basic card structure', async () => {
      const el = await fixture(card.render() as TemplateResult);
      expect(el.tagName).to.equal('HA-CARD');
      expect(el.querySelector('.grid')).to.exist;
    });

    it('should render problem entities correctly', async () => {
      card['_sensors'].problemSensors = [
        {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: {},
          domain: 'light',
        },
        {
          entity_id: 'sensor.humidity',
          state: '45',
          attributes: {},
          domain: 'sensor',
        },
      ];
      const el = await fixture(card.render() as TemplateResult);
      const problemIcon = el.querySelector('.status-entities')!;
      expect(problemIcon).to.exist;
      expect((problemIcon as any).icon).to.equal('mdi:numeric-2');
    });

    it('should render room icon using room-state-icon component', async () => {
      const el = await fixture(card.render() as TemplateResult);
      const roomStateIcon = el.querySelector('room-state-icon');

      expect(roomStateIcon).to.exist;
      expect((roomStateIcon as any).isMainRoomEntity).to.be.true;
    });

    it('should render entity-slider when slider feature is enabled', async () => {
      card.setConfig({ area: 'living_room', features: ['slider'] });
      card.hass = mockHass;
      const el = await fixture(card.render() as TemplateResult);
      const entitySlider = el.querySelector('entity-slider');
      const entityCollection = el.querySelector('entity-collection');

      expect(entitySlider).to.exist;
      expect(entityCollection).to.not.exist;
    });

    it('should render entity-collection when slider feature is not enabled', async () => {
      card.setConfig({ area: 'living_room' });
      card.hass = mockHass;
      const el = await fixture(card.render() as TemplateResult);
      const entitySlider = el.querySelector('entity-slider');
      const entityCollection = el.querySelector('entity-collection');

      expect(entityCollection).to.exist;
      expect(entitySlider).to.not.exist;
    });

    it('should render card overlay when full_card_actions feature is enabled', async () => {
      card.setConfig({ area: 'living_room', features: ['full_card_actions'] });
      card.hass = mockHass;
      const el = await fixture(card.render() as TemplateResult);
      const overlay = el.querySelector('.card-overlay');

      expect(overlay).to.exist;
    });

    it('should not render card overlay when full_card_actions feature is not enabled', async () => {
      card.setConfig({ area: 'living_room' });
      card.hass = mockHass;
      const el = await fixture(card.render() as TemplateResult);
      const overlay = el.querySelector('.card-overlay');

      expect(overlay).to.not.exist;
    });
  });

  describe('getConfigElement()', () => {
    it('should return a room-summary-card-editor element', () => {
      const element = RoomSummaryCard.getConfigElement();
      expect(element.tagName.toLowerCase()).to.equal(
        'room-summary-card-editor',
      );
    });
  });

  describe('getStubConfig()', () => {
    it('should return first area with matching entities', async () => {
      const config = await RoomSummaryCard.getStubConfig(mockHass);
      expect(config.area).to.equal('living_room');
    });

    it('should return empty string if no areas have matching entities', async () => {
      const emptyHass = {
        ...mockHass,
        entities: {},
        areas: { kitchen: { area_id: 'kitchen', name: 'Kitchen' } },
      };
      const config = await RoomSummaryCard.getStubConfig(emptyHass as any);
      expect(config.area).to.equal('');
    });
  });
});
