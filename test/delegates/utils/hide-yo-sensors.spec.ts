import { getSensors } from '@delegates/utils/hide-yo-sensors';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';

export default () => {
  describe('get-sensors.ts', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      mockHass = {
        states: {
          'sensor.living_room_temperature': e(
            'sensor',
            'living_room_temperature',
            '72',
            {
              device_class: 'temperature',
              unit_of_measurement: '°F',
            },
          ),
          'sensor.living_room_humidity': e(
            'sensor',
            'living_room_humidity',
            '45',
            {
              device_class: 'humidity',
              unit_of_measurement: '%',
            },
          ),
          'sensor.living_room_pressure': e(
            'sensor',
            'living_room_pressure',
            '1013',
            {
              device_class: 'pressure',
              unit_of_measurement: 'hPa',
            },
          ),
          'sensor.custom_sensor_1': e('sensor', 'custom_sensor_1', '100'),
          'sensor.custom_sensor_2': e('sensor', 'custom_sensor_2', '200'),
          'sensor.other_area_temp': e('sensor', 'other_area_temp', '68', {
            device_class: 'temperature',
          }),
        },
        entities: {
          'sensor.living_room_temperature': {
            entity_id: 'sensor.living_room_temperature',
            device_id: 'device_1',
            area_id: 'living_room',
            labels: [],
          },
          'sensor.living_room_humidity': {
            entity_id: 'sensor.living_room_humidity',
            device_id: 'device_2',
            area_id: 'living_room',
            labels: [],
          },
          'sensor.living_room_pressure': {
            entity_id: 'sensor.living_room_pressure',
            device_id: 'device_3',
            area_id: 'living_room',
            labels: [],
          },
          'sensor.custom_sensor_1': {
            entity_id: 'sensor.custom_sensor_1',
            device_id: 'device_4',
            area_id: 'living_room',
            labels: [],
          },
          'sensor.custom_sensor_2': {
            entity_id: 'sensor.custom_sensor_2',
            device_id: 'device_5',
            area_id: 'living_room',
            labels: [],
          },
          'sensor.other_area_temp': {
            entity_id: 'sensor.other_area_temp',
            device_id: 'device_6',
            area_id: 'kitchen', // Different area
            labels: [],
          },
        },
        devices: {
          device_1: { area_id: 'living_room' },
          device_2: { area_id: 'living_room' },
          device_3: { area_id: 'living_room' },
          device_4: { area_id: 'living_room' },
          device_5: { area_id: 'living_room' },
          device_6: { area_id: 'kitchen' },
        },
        areas: {
          living_room: {
            area_id: 'living_room',
            name: 'Living Room',
            icon: 'mdi:sofa',
          },
          kitchen: {
            area_id: 'kitchen',
            name: 'Kitchen',
            icon: 'mdi:kitchen',
          },
        },
      } as any as HomeAssistant;
    });

    it('should return temperature and humidity sensors in correct order when no config sensors', () => {
      const config: Config = {
        area: 'living_room',
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(2);
      expect(result[0]!.entity_id).to.equal('sensor.living_room_temperature');
      expect(result[1]!.entity_id).to.equal('sensor.living_room_humidity');
    });

    it('should order config sensors by their position in config.sensors array', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [
          'sensor.custom_sensor_2',
          'sensor.living_room_pressure',
          'sensor.custom_sensor_1',
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(5); // 2 default + 3 config
      // Temperature and humidity first (not in config)
      expect(result[0]!.entity_id).to.equal('sensor.living_room_temperature');
      expect(result[1]!.entity_id).to.equal('sensor.living_room_humidity');
      // Then config sensors in specified order
      expect(result[2]!.entity_id).to.equal('sensor.custom_sensor_2');
      expect(result[3]!.entity_id).to.equal('sensor.living_room_pressure');
      expect(result[4]!.entity_id).to.equal('sensor.custom_sensor_1');
    });

    it('should put temperature/humidity in config order when explicitly defined', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [
          'sensor.living_room_humidity', // Humidity first
          'sensor.custom_sensor_1',
          'sensor.living_room_temperature', // Temperature last
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(3);
      // Should follow config order exactly
      expect(result[0]!.entity_id).to.equal('sensor.living_room_humidity');
      expect(result[1]!.entity_id).to.equal('sensor.custom_sensor_1');
      expect(result[2]!.entity_id).to.equal('sensor.living_room_temperature');
    });

    it('should exclude sensors from other areas', () => {
      const config: Config = {
        area: 'living_room',
        sensors: ['sensor.other_area_temp'], // This is in kitchen area
      };

      const result = getSensors(mockHass, config);

      // Should only get living room temp/humidity, not the kitchen sensor
      expect(result).to.have.lengthOf(2);
      expect(result.map((s) => s.entity_id)).to.not.include(
        'sensor.other_area_temp',
      );
    });

    it('should handle entities assigned via device area', () => {
      // Add entity with no direct area but device in correct area
      mockHass.entities['sensor.device_area_sensor'] = {
        entity_id: 'sensor.device_area_sensor',
        device_id: 'device_1', // This device is in living_room
        area_id: '', // No direct area
        labels: [],
      };
      mockHass.states['sensor.device_area_sensor'] = e(
        'sensor',
        'device_area_sensor',
        '50',
        {
          device_class: 'illuminance',
        },
      );

      const config: Config = {
        area: 'living_room',
        sensors: ['sensor.device_area_sensor'],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(3); // temp + humidity + device sensor
      expect(result.map((s) => s.entity_id)).to.include(
        'sensor.device_area_sensor',
      );
    });

    it('should handle missing entities gracefully', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [
          'sensor.living_room_temperature',
          'sensor.nonexistent_sensor', // This doesn't exist
          'sensor.living_room_humidity',
        ],
      };

      const result = getSensors(mockHass, config);

      // Should include only the existing sensors
      expect(result).to.have.lengthOf(2);
      expect(result[0]!.entity_id).to.equal('sensor.living_room_temperature');
      expect(result[1]!.entity_id).to.equal('sensor.living_room_humidity');
    });

    it('should return empty array when no matching sensors found', () => {
      const config: Config = {
        area: 'empty_area',
      };

      const result = getSensors(mockHass, config);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should handle mixed scenario with partial config overlap', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [
          'sensor.custom_sensor_1',
          'sensor.living_room_temperature', // This is also a default temp sensor
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(3);
      // Humidity first (default, not in config)
      expect(result[0]!.entity_id).to.equal('sensor.living_room_humidity');
      // Then config sensors in order
      expect(result[1]!.entity_id).to.equal('sensor.custom_sensor_1');
      expect(result[2]!.entity_id).to.equal('sensor.living_room_temperature');
    });

    it('should skip default temperature and humidity sensors when exclude_default_entities is enabled', () => {
      const config: Config = {
        area: 'living_room',
        features: ['exclude_default_entities'],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(0);
      expect(result.map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_temperature',
      );
      expect(result.map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_humidity',
      );
    });

    it('should still include config sensors when exclude_default_entities is enabled', () => {
      const config: Config = {
        area: 'living_room',
        features: ['exclude_default_entities'],
        sensors: [
          'sensor.custom_sensor_1',
          'sensor.living_room_temperature', // Explicitly configured
        ],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(2);
      expect(result[0]!.entity_id).to.equal('sensor.custom_sensor_1');
      expect(result[1]!.entity_id).to.equal('sensor.living_room_temperature');
      // Should not include humidity since it's not in config and we're excluding defaults
      expect(result.map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_humidity',
      );
    });

    it('should not include pressure sensor when exclude_default_entities is enabled and not in config', () => {
      const config: Config = {
        area: 'living_room',
        features: ['exclude_default_entities'],
        sensors: ['sensor.custom_sensor_1'],
      };

      const result = getSensors(mockHass, config);

      expect(result).to.have.lengthOf(1);
      expect(result[0]!.entity_id).to.equal('sensor.custom_sensor_1');
      // Should not include pressure sensor (device_class: pressure) since it's not temp/humidity
      expect(result.map((s) => s.entity_id)).to.not.include(
        'sensor.living_room_pressure',
      );
    });
  });
};
