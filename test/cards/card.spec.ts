import { RoomSummaryCard } from '@cards/card';
import { EntityCollection } from '@cards/components/entity-collection/entity-collection';
import { EntitySlider } from '@cards/components/entity-slider/entity-slider';
import { RoomStateIcon } from '@cards/components/room-state-icon/room-state-icon';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as setupCardModule from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import * as renderHorizontalSliderModule from '@html/render-horizontal-slider';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e, createState as s } from '@test/test-helpers';
import * as cardStylesModule from '@theme/render/card-styles';
import { styles } from '@theme/styles';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

for (const [tag, Ctor] of [
  ['room-summary-card', RoomSummaryCard],
  ['room-state-icon', RoomStateIcon],
  ['entity-slider', EntitySlider],
  ['entity-collection', EntityCollection],
] as const) {
  if (!customElements.get(tag)) {
    customElements.define(tag, Ctor);
  }
}

/** Capture before any sinon stub replaces the module export. */
const renderCardStylesOriginal = cardStylesModule.renderCardStyles;

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: HomeAssistant;
  let actionHandlerStub: sinon.SinonStub;
  let getRoomPropertiesStub: sinon.SinonStub;
  let renderCardStylesStub: sinon.SinonStub;
  let renderHorizontalSliderStub: sinon.SinonStub;

  beforeEach(() => {
    renderCardStylesStub = stub(cardStylesModule, 'renderCardStyles').callsFake(
      (...args: Parameters<typeof renderCardStylesOriginal>) =>
        renderCardStylesOriginal(...args),
    );
    renderHorizontalSliderStub = stub(
      renderHorizontalSliderModule,
      'renderHorizontalSlider',
    );
    actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
      bind: () => {},
      handleAction: () => {},
    });
    getRoomPropertiesStub = stub(setupCardModule, 'getRoomProperties').returns({
      roomInfo: { area_name: 'Living Room' },
      roomEntity: {
        config: { entity_id: 'light.test' },
        state: e('light', 'test', 'on', {}),
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
        alarm: 'occupied',
        dark: true,
        frostedGlass: false,
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
    renderCardStylesStub.restore();
    renderHorizontalSliderStub.restore();
    actionHandlerStub.restore();
    getRoomPropertiesStub.restore();
  });

  describe('setConfig', () => {
    it('should set the config', () => {
      const config = { area: 'living_room' };
      card.setConfig(config);
      expect(card['_config']).to.deep.equal(config);
    });

    it('should set entity when background.opacity is an entity id string', () => {
      const opacityEntity = 'sensor.room_opacity';
      card.setConfig({
        area: 'living_room',
        background: { opacity: opacityEntity },
      });
      expect(card['entity']).to.equal(opacityEntity);
    });

    it('should clear entity when background.opacity is not a string', () => {
      card.setConfig({
        area: 'living_room',
        background: { opacity: 'sensor.was_entity' },
      });
      expect(card['entity']).to.equal('sensor.was_entity');

      card.setConfig({
        area: 'living_room',
        background: { opacity: 0.5 },
      });
      expect(card['entity']).to.be.undefined;
    });
  });

  describe('hass property setter', () => {
    it('should update internal state and flags from getRoomProperties', () => {
      expect(card['_roomEntity']).to.exist;
      expect(card['_sensors']).to.exist;
      expect(card['_roomInformation']).to.exist;
      expect(card['dark']).to.be.true; // Since mockHass has darkMode: true
      expect(card['alarm']).to.equal('occupied'); // Should be set based on alarm state
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
          alarm: undefined,
          dark: false,
          frostedGlass: false,
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
          alarm: 'occupied',
          dark: true,
          frostedGlass: false,
        },
      });

      card.hass = mockHass;
      // Wait for image promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.true;
    });

    it('should set image property even when icon_background option is set', async () => {
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
          alarm: 'occupied',
          dark: true,
          frostedGlass: false,
        },
      });

      card.hass = mockHass;
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.true;
      expect(card.hasAttribute('icon-bg')).to.be.false;
    });

    it('should set image property when icon_background option is not set', async () => {
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
          alarm: 'occupied',
          dark: true,
          frostedGlass: false,
        },
      });

      card.hass = mockHass;
      // Wait for image promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(card['_image']).to.equal('/local/test.jpg');
      expect(card['image']).to.be.true;
      expect(card.hasAttribute('icon-bg')).to.be.false;
    });

    it('should set frostedGlass property from getRoomProperties flags', () => {
      expect(card['frostedGlass']).to.equal(
        getRoomPropertiesStub.returnValues[0].flags.frostedGlass,
      );
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
        e('light', 'living_room', 'on', {}),
        e('sensor', 'humidity', '45', {}),
      ];
      const el = await fixture(card.render() as TemplateResult);
      const problemIndicator = el.querySelector('.status-entities')!;
      expect(problemIndicator).to.exist;
      expect(problemIndicator.textContent).to.equal('2');
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

    it('should call renderHorizontalSlider with hass and config', () => {
      card.render();

      expect(renderHorizontalSliderStub.calledOnce).to.be.true;
      expect(renderHorizontalSliderStub.calledWith(mockHass, card['_config']))
        .to.be.true;
    });

    it('should pass mixin state to renderCardStyles as opacity state', () => {
      const opacityState = e('sensor', 'opacity', '128', {
        unit_of_measurement: '%',
      });
      card['state'] = opacityState;
      card.render();

      expect(renderCardStylesStub.calledOnce).to.be.true;
      expect(renderCardStylesStub.lastCall.args[8]).to.equal(opacityState);
    });

    it('should pass undefined to renderCardStyles when mixin state is unset', () => {
      card['state'] = undefined;
      card.render();

      expect(renderCardStylesStub.calledOnce).to.be.true;
      expect(renderCardStylesStub.lastCall.args[8]).to.be.undefined;
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
