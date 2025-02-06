import { expect } from 'chai';
import { stub } from 'sinon';
import { RoomSummaryCard } from '../src/card';
import { type HomeAssistant } from '../src/types/homeassistant';
import { createStateEntity as s } from './helpers';

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: Partial<HomeAssistant>;
  let consoleInfoStub: sinon.SinonStub;

  beforeEach(() => {
    consoleInfoStub = stub(console, 'info');
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
  });

  afterEach(() => {
    consoleInfoStub.restore();
  });

  describe('setConfig', () => {
    it('should set default sensors when not provided', () => {
      card.setConfig({ area: 'living_room' });
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
  });

  describe('hass property setter', () => {
    beforeEach(() => {
      card.setConfig({ area: 'living_room' });
    });

    it('should update states when hass changes', () => {
      card.hass = mockHass as HomeAssistant;
      expect(card['_states']).to.exist;
    });

    it('should update room entity when hass changes', () => {
      card.hass = mockHass as HomeAssistant;
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
});
