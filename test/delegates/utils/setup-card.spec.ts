import { getRoomProperties } from '@delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { createState as s } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';

export default () => {
  describe('setup-card.ts', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      mockHass = {
        states: {
          'light.living_room_light': s('light', 'living_room_light', 'on', {
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
          'light.living_room_light': {
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
            name: 'Living Room',
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
    });

    describe('getRoomProperties', () => {
      it('should return all required properties with basic config', () => {
        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result).to.have.all.keys([
          'roomInfo',
          'states',
          'roomEntity',
          'problemEntities',
          'problemExists',
          'sensors',
          'isDarkMode',
        ]);

        // Verify room info
        expect(result.roomInfo.area_name).to.equal('Living Room');

        // Verify states (should include default entities)
        expect(result.states).to.be.an('array');
        expect(Object.keys(result.states)).to.have.lengthOf(2);
        expect(result.states.map((s) => s.config.entity_id)).to.include(
          'light.living_room_light',
        );
        expect(result.states.map((s) => s.config.entity_id)).to.include(
          'switch.living_room_fan',
        );

        // Verify room entity
        expect(result.roomEntity).to.be.an('object');
        expect(result.roomEntity.config.entity_id).to.equal(
          'light.living_room_light',
        );

        // Verify problem entities (should be empty by default)
        expect(result.problemEntities).to.be.an('array');
        expect(result.problemEntities).to.have.lengthOf(0);
        expect(result.problemExists).to.be.false;

        // Verify sensors (should include default temperature and humidity sensors)
        expect(result.sensors).to.be.an('array');
        expect(result.sensors).to.have.lengthOf(2);
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.living_room_climate_air_temperature',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.living_room_climate_humidity',
        );

        // Verify dark mode
        expect(result.isDarkMode).to.be.true;
      });

      it('should handle complex sensor configurations correctly', () => {
        // Test with legacy temperature_sensor and humidity_sensor
        const legacyConfig: Config = {
          area: 'living_room',
          temperature_sensor: 'sensor.custom_sensor',
          humidity_sensor: 'sensor.additional_sensor',
        } as any;

        let result = getRoomProperties(mockHass, legacyConfig);

        // Should use the specified legacy sensors instead of defaults
        expect(result.sensors).to.have.lengthOf(2);
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.custom_sensor',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.additional_sensor',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.not.include(
          'sensor.living_room_climate_air_temperature',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.not.include(
          'sensor.living_room_climate_humidity',
        );

        // Test with new sensors array plus legacy temperature/humidity sensor
        const mixedConfig: Config = {
          area: 'living_room',
          temperature_sensor: 'sensor.custom_sensor', // Legacy property
          humidity_sensor: 'sensor.additional_sensor', // Legacy property
          sensors: ['sensor.living_room_climate_air_temperature'], // New property
        } as any;

        result = getRoomProperties(mockHass, mixedConfig);

        // Should include both legacy sensors AND the sensors array value
        expect(result.sensors).to.have.lengthOf(3);
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.custom_sensor',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.additional_sensor',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.living_room_climate_air_temperature',
        );

        // Test with just new sensors array
        const newConfig: Config = {
          area: 'living_room',
          sensors: ['sensor.custom_sensor', 'sensor.additional_sensor'],
        };

        result = getRoomProperties(mockHass, newConfig);

        // Should include default sensors (from area) AND all values in sensors array
        expect(result.sensors).to.have.lengthOf(4);
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.living_room_climate_air_temperature',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.living_room_climate_humidity',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.custom_sensor',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.include(
          'sensor.additional_sensor',
        );
      });

      it('should handle problem entities correctly', () => {
        // Add problem entities to mock
        mockHass.entities['binary_sensor.problem'] = {
          labels: ['problem'],
          area_id: 'living_room',
          device_id: 'device_1',
        };
        mockHass.states['binary_sensor.problem'] = s(
          'binary_sensor',
          'problem',
          'on',
        );

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.problemEntities).to.have.length.above(0);
        expect(result.problemExists).to.be.true;
      });

      it('should use area_name from config when provided', () => {
        const config: Config = {
          area: 'living_room',
          area_name: 'Custom Room Name',
        };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('Custom Room Name');
      });

      it('should fallback to area ID when no area name available', () => {
        // Remove area name from mock
        // @ts-ignore
        mockHass.areas.living_room!.name = null;

        const config: Config = { area: 'living_room' };
        const result = getRoomProperties(mockHass, config);

        expect(result.roomInfo.area_name).to.equal('living_room');
      });

      it('should handle exclude_default_entities feature', () => {
        const config: Config = {
          area: 'living_room',
          features: ['exclude_default_entities'],
          entities: ['light.custom_light'],
        };

        const result = getRoomProperties(mockHass, config);

        // Should not include default sensors when exclude_default_entities is set
        expect(result.sensors).to.be.an('array');
        // Only custom sensors should be included, no defaults
        expect(result.sensors.map((s) => s.entity_id)).to.not.include(
          'sensor.living_room_climate_air_temperature',
        );
        expect(result.sensors.map((s) => s.entity_id)).to.not.include(
          'sensor.living_room_climate_humidity',
        );
      });
    });
  });
};
