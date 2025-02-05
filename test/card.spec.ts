import { expect } from 'chai';
import { RoomSummaryCard } from '../src/card';
import { type HomeAssistant } from '../src/types/homeassistant';

describe('card.ts', () => {
  let card: RoomSummaryCard;
  let mockHass: Partial<HomeAssistant>;

  beforeEach(() => {
    card = new RoomSummaryCard();
    mockHass = {
      states: {
        'light.living_room': {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: {
            friendly_name: 'Living Room Light',
          },
          getDomain() {
            return 'light';
          },
        },
        'sensor.living_room_climate_humidity': {
          entity_id: 'sensor.living_room_climate_humidity',
          state: '50',
          attributes: {},
          getDomain() {
            return 'sensor';
          },
        },
        'sensor.living_room_climate_air_temperature': {
          entity_id: 'sensor.living_room_climate_air_temperature',
          state: '72',
          attributes: {},
          getDomain() {
            return 'sensor';
          },
        },
      },
      devices: {},
      entities: {},
      areas: {},
    };
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
      mockHass.states!['binary_sensor.problem'] = {
        state: 'on',
        attributes: {},
        getDomain: () => 'binary_sensor',
        entity_id: 'binary_sensor.problem',
      };

      card.hass = mockHass as HomeAssistant;
      expect(card['_problemEntities']).to.have.length.above(0);
    });
  });
});
