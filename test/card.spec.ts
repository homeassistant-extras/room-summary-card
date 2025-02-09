import { fixture } from '@open-wc/testing';
import { expect } from 'chai';
import { stub } from 'sinon';
import * as actionHandlerModule from '../src/action-handler';
import { RoomSummaryCard } from '../src/card';
import { type HomeAssistant } from '../src/types/homeassistant';
import { createStateEntity as s } from './test-helpers';

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: Partial<HomeAssistant>;
  let consoleInfoStub: sinon.SinonStub;
  let actionHandlerStub: sinon.SinonStub;

  beforeEach(() => {
    consoleInfoStub = stub(console, 'info');
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
      },
      devices: {},
      entities: {},
      areas: {},
    };
    card.setConfig({ area: 'living_room' });
    card.hass = mockHass as HomeAssistant;
  });

  afterEach(() => {
    consoleInfoStub.restore();
    actionHandlerStub.restore();
  });

  describe('setConfig', () => {
    it('should set default sensors when not provided', () => {
      expect(card['_config'].humidity_sensor).to.equal(
        'sensor.living_room_climate_humidity',
      );
      expect(card['_config'].temperature_sensor).to.equal(
        'sensor.living_room_climate_air_temperature',
      );
    });

    it('should preserve custom sensor config', () => {
      card.setConfig({
        area: 'living_room',
        humidity_sensor: 'sensor.custom_humidity',
        temperature_sensor: 'sensor.custom_temp',
      });
      expect(card['_config'].humidity_sensor).to.equal(
        'sensor.custom_humidity',
      );
      expect(card['_config'].temperature_sensor).to.equal('sensor.custom_temp');
    });

    it('should set labels as true by default', () => {
      expect(card['_config'].options!.label).to.equal(true);
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
  });

  describe('rendering', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
        options: {
          label: true,
        },
      });
    });

    it('should handle missing climate sensors gracefully', async () => {
      delete mockHass.states!['sensor.living_room_climate_humidity'];
      delete mockHass.states!['sensor.living_room_climate_air_temperature'];

      const el = await fixture(card.render());
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
      const el = await fixture(card.render());
      const problemIcon = el.querySelector('.status-entities')!;
      expect(problemIcon).to.exist;
      expect((problemIcon as any).icon).to.equal('mdi:numeric-2');
    });

    it('should handle area names with multiple underscores', async () => {
      card.setConfig({
        area: 'second_floor_living_room',
        options: { label: true },
      });
      const el = await fixture(card.render());
      const nameDiv = el.querySelector('.name');
      expect(nameDiv!.textContent!.trim()).to.equal('Second Floor Living Room');
    });

    it('should handle empty device and entity lists', async () => {
      const el = await fixture(card.render());
      const stats = el.querySelector('.stats');
      expect(stats!.textContent).to.include('0 devices');
      expect(stats!.textContent).to.include('0 entities');
    });

    it('should render correctly with minimal configuration', async () => {
      const el = await fixture(card.render());
      expect(el.parentNode).to.exist;
      expect(el.querySelector('.grid')).to.exist;
      expect(el.querySelector('.name')).to.exist;
    });

    it('should handle entities with undefined states', async () => {
      mockHass.states!['light.living_room']!.state = '';
      const el = await fixture(card.render());
      expect(el.parentNode).to.exist;
      expect(el.querySelector('.grid')).to.exist;
      // Should still render without errors
    });
  });
});
