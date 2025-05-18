import { RoomSummaryCard } from '@/cards/card';
import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { styles } from '@theme/styles';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { createState as s } from '../test-helpers';

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: HomeAssistant;
  let actionHandlerStub: sinon.SinonStub;

  beforeEach(() => {
    actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
      bind: () => {}, // Mock the bind method
      handleAction: () => {}, // Add any other methods that might be called
    });
    card = new RoomSummaryCard();
    mockHass = {
      states: {
        'light.living_room': s('light', 'living_room', 'on', {
          friendly_name: 'Living Room Light',
        }),
        'switch.living_room_fan': s('switch', 'living_room_fan', 'off', {
          friendly_name: 'Living Room Fan',
        }),
        'sensor.living_room_climate_humidity': s(
          'sensor',
          'living_room_climate_humidity',
          '50',
        ),
        'sensor.living_room_climate_air_temperature': s(
          'sensor',
          'living_room_climate_air_temperature',
          '72',
        ),
        'sensor.custom_sensor': s('sensor', 'custom_sensor', '25'),
        'sensor.additional_sensor': s('sensor', 'additional_sensor', '60'),
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
        living_room: {
          area_id: 'living_room',
          icon: '',
        },
        bedroom: {
          area_id: 'bedroom',
          icon: '',
        },
      },
      themes: {
        darkMode: true,
        theme: 'default',
      },
    } as any as HomeAssistant;
    card.setConfig({ area: 'living_room' });
    card.hass = mockHass as HomeAssistant;
  });

  afterEach(() => {
    actionHandlerStub.restore();
  });

  describe('setConfig', () => {
    it('should set the config', () => {
      const config = {
        area: 'living_room',
      };
      card.setConfig(config);
      expect(card['_config']).to.deep.equal(config);
    });
  });

  describe('hass property setter', () => {
    it('should update states when hass changes', () => {
      expect(card['_states']).to.exist;
    });

    it('should update room entity when hass changes', () => {
      expect(card['_roomEntity']).to.exist;
    });

    it('should handle problem entities', () => {
      mockHass.entities = {
        'binary_sensor.problem': {
          labels: ['problem'],
          area_id: 'living_room',
          device_id: 'device_1',
        },
      };
      mockHass.states!['binary_sensor.problem'] = s(
        'binary_sensor',
        'problem',
        'on',
      );

      card.hass = mockHass as HomeAssistant;

      expect(card['_problemEntities']).to.have.length.above(0);
    });

    it('should correctly handle legacy sensors and new sensors array', async () => {
      // Should have found both default sensors in the _sensors array
      expect(card['_sensors']).to.exist;
      expect(card['_sensors']).to.have.lengthOf(2);
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.living_room_climate_air_temperature',
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.living_room_climate_humidity',
      );

      // Test with legacy temperature_sensor and humidity_sensor
      card.setConfig({
        area: 'living_room',
        temperature_sensor: 'sensor.custom_sensor',
        humidity_sensor: 'sensor.additional_sensor',
      } as any as Config);
      card.hass = mockHass;

      // Should use the specified legacy sensors instead of defaults
      expect(card['_sensors']).to.exist;
      expect(card['_sensors']).to.have.lengthOf(2);
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.custom_sensor',
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.additional_sensor',
      );
      // Should NOT include the default sensors when overridden
      expect(card['_sensors'].map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_climate_air_temperature',
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_climate_humidity',
      );

      // Test with new sensors array plus legacy temperature/humidity sensor
      card.setConfig({
        area: 'living_room',
        temperature_sensor: 'sensor.custom_sensor', // Legacy property
        humidity_sensor: 'sensor.additional_sensor', // Legacy property
        sensors: ['sensor.living_room_climate_air_temperature'], // New property
      } as any as Config);
      card.hass = mockHass;

      // Should include both legacy sensors AND the sensors array value
      expect(card['_sensors']).to.exist;
      expect(card['_sensors']).to.have.lengthOf(3);
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.custom_sensor', // Legacy temperature sensor
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.additional_sensor', // Legacy humidity sensor
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.living_room_climate_air_temperature', // From sensors array
      );

      // Test with just new sensors array
      card.setConfig({
        area: 'living_room',
        sensors: ['sensor.custom_sensor', 'sensor.additional_sensor'],
      });
      card.hass = mockHass;

      // Should include default sensors (from area) AND all values in sensors array
      expect(card['_sensors']).to.exist;
      expect(card['_sensors']).to.have.lengthOf(4);
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.living_room_climate_air_temperature', // Default from area
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.living_room_climate_humidity', // Default from area
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.custom_sensor', // From sensors array
      );
      expect(card['_sensors'].map((s) => s.entity_id)).to.include(
        'sensor.additional_sensor', // From sensors array
      );
    });
  });

  describe('styles', () => {
    it('should return expected styles', () => {
      const actual = RoomSummaryCard.styles;
      expect(actual).to.deep.equal(styles);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
      });
    });

    it('should render nothing if no room info', async () => {
      (card as any)._roomInformation = undefined;
      const el = card.render();
      expect(el).to.equal(nothing);
    });

    it('should not render label if `hide_climate_label` set', async () => {
      card.setConfig({
        area: 'living_room',
        features: ['hide_climate_label'],
      });
      const el = await fixture(card.render() as TemplateResult);
      const label = el.querySelector('.label p');
      expect(label).to.not.exist;
    });

    it('should handle missing climate sensors gracefully', async () => {
      delete mockHass.states!['sensor.living_room_climate_humidity'];
      delete mockHass.states!['sensor.living_room_climate_air_temperature'];

      const el = await fixture(card.render() as TemplateResult);
      const label = el.querySelector('.label');
      expect(label).to.exist;
      expect(label!.textContent).to.not.include('°C');
      expect(label!.textContent).to.not.include('%');
    });

    it('should render multiple problem entities correctly', async () => {
      card['_problemEntities'] = [
        'light.living_room',
        'sensor.living_room_climate_humidity',
      ];
      card['_problemExists'] = true;
      const el = await fixture(card.render() as TemplateResult);
      const problemIcon = el.querySelector('.status-entities')!;
      expect(problemIcon).to.exist;
      expect((problemIcon as any).icon).to.equal('mdi:numeric-2');
    });

    it('should use the area name', async () => {
      mockHass.areas.living_room!.name = 'I am a room';
      card.hass = mockHass;
      const el = await fixture(card.render() as TemplateResult);
      const nameDiv = el.querySelector('.name');
      expect(nameDiv!.textContent!.trim()).to.equal('I am a room');
    });

    it('should use the config area id as fallback', async () => {
      const el = await fixture(card.render() as TemplateResult);
      const nameDiv = el.querySelector('.name');
      expect(nameDiv!.textContent!.trim()).to.equal('living_room');
    });

    it('should handle empty device and entity lists', async () => {
      mockHass.devices = {};
      mockHass.entities = {};
      const el = await fixture(card.render() as TemplateResult);
      const stats = el.querySelector('.stats');
      expect(stats!.textContent).to.include('0 devices');
      expect(stats!.textContent).to.include('0 entities');
    });

    it('should render correctly with minimal configuration', async () => {
      const el = await fixture(card.render() as TemplateResult);
      expect(el.parentNode).to.exist;
      expect(el.querySelector('.grid')).to.exist;
      expect(el.querySelector('.name')).to.exist;
    });

    it('should handle entities with undefined states', async () => {
      mockHass.states!['light.living_room']!.state = '';
      const el = await fixture(card.render() as TemplateResult);
      expect(el.parentNode).to.exist;
      expect(el.querySelector('.grid')).to.exist;
      // Should still render without errors
    });

    it('should render area statistics by default', async () => {
      const el = await fixture(card.render() as TemplateResult);
      const stats = el.querySelector('.stats');
      expect(stats).to.exist;
      expect(stats!.textContent).to.include('2 devices');
      expect(stats!.textContent).to.include('2 entities');
    });

    it('should not render area statistics when hide_area_stats is set', async () => {
      card.setConfig({
        area: 'living_room',
        features: ['hide_area_stats'],
      });
      const el = await fixture(card.render() as TemplateResult);
      const stats = el.querySelector('.stats');
      expect(stats).to.not.exist;
    });

    it('should render correct device and entity counts', async () => {
      // Add more devices and entities
      mockHass.devices.device_3 = { area_id: 'living_room' };
      mockHass.entities['sensor.living_room_motion'] = {
        device_id: 'device_3',
        area_id: 'living_room',
        labels: [],
      };

      card.hass = mockHass as HomeAssistant;
      const el = await fixture(card.render() as TemplateResult);
      const stats = el.querySelector('.stats');
      expect(stats!.textContent).to.include('3 devices');
      expect(stats!.textContent).to.include('3 entities');
    });

    it('should handle areas with no devices or entities', async () => {
      const emptyAreaHass = {
        ...mockHass,
        devices: {},
        entities: {},
      };
      card.hass = emptyAreaHass as HomeAssistant;
      const el = await fixture(card.render() as TemplateResult);
      const stats = el.querySelector('.stats');
      expect(stats!.textContent).to.include('0 devices');
      expect(stats!.textContent).to.include('0 entities');
    });
  });

  describe('getConfigElement()', () => {
    it('should return a room-summary-card-editor element', () => {
      const element = RoomSummaryCard.getConfigElement();

      expect(element).to.be.an('HTMLElement');
      expect(element.tagName.toLowerCase()).to.equal(
        'room-summary-card-editor',
      );
    });

    it('should return a new element instance each time', () => {
      const element1 = RoomSummaryCard.getConfigElement();
      const element2 = RoomSummaryCard.getConfigElement();

      expect(element1).to.not.equal(element2);
    });
  });

  describe('getStubConfig()', () => {
    it('should return first area with matching entities', async () => {
      const config = await RoomSummaryCard.getStubConfig(mockHass);
      expect(config).to.be.an('object');
      expect(config).to.have.property('area');
      expect(config.area).to.equal('living_room');
    });

    it('should return empty string if no areas have matching entities', async () => {
      const emptyHass = {
        ...mockHass,
        entities: {},
        areas: {
          kitchen: {
            area_id: 'kitchen',
            name: 'Kitchen',
          },
        },
      };
      const config = await RoomSummaryCard.getStubConfig(
        emptyHass as any as HomeAssistant,
      );
      expect(config.area).to.equal('');
    });

    it('should find area with only light entity', async () => {
      const lightOnlyHass = {
        ...mockHass,
        entities: {
          'light.bedroom_light': {
            area_id: 'bedroom',
          },
        },
      };
      const config = await RoomSummaryCard.getStubConfig(
        lightOnlyHass as any as HomeAssistant,
      );
      expect(config.area).to.equal('bedroom');
    });

    it('should find area with only fan entity', async () => {
      const fanOnlyHass = {
        ...mockHass,
        entities: {
          'switch.bedroom_fan': {
            area_id: 'bedroom',
          },
        },
      };
      const config = await RoomSummaryCard.getStubConfig(
        fanOnlyHass as any as HomeAssistant,
      );
      expect(config.area).to.equal('bedroom');
    });
  });
});
