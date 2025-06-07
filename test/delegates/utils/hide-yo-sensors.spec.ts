import { getSensors } from '@delegates/utils/hide-yo-sensors';
import * as sensorAveragesModule from '@delegates/utils/sensor-averages';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('get-sensors.ts', () => {
    let mockHass: HomeAssistant;
    let calculateAveragesStub: SinonStub;

    beforeEach(() => {
      calculateAveragesStub = stub(sensorAveragesModule, 'calculateAverages');

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

      // Default stub return
      calculateAveragesStub.returns([]);
    });

    afterEach(() => {
      calculateAveragesStub.restore();
    });

    it('should return SensorData with individual and averaged properties', () => {
      const config: Config = {
        area: 'living_room',
      };

      const mockAveraged = [
        e('sensor', 'averaged_temp', '72', { device_class: 'temperature' }),
      ];
      calculateAveragesStub.returns(mockAveraged);

      const result = getSensors(mockHass, config);

      expect(result).to.have.keys(['individual', 'averaged']);
      expect(result.individual).to.be.an('array');
      expect(result.averaged).to.equal(mockAveraged);
    });

    it('should call calculateAverages with correct parameters', () => {
      const config: Config = {
        area: 'living_room',
        sensor_classes: ['temperature', 'humidity', 'pressure'],
      };

      getSensors(mockHass, config);

      expect(calculateAveragesStub.calledOnce).to.be.true;
      const [classSensors, sensorClasses] =
        calculateAveragesStub.firstCall.args;

      // Should include temp, humidity, and pressure sensors from living_room
      expect(classSensors).to.have.lengthOf(3);
      expect(classSensors.map((s: any) => s.entity_id)).to.include.members([
        'sensor.living_room_temperature',
        'sensor.living_room_humidity',
        'sensor.living_room_pressure',
      ]);
      expect(sensorClasses).to.deep.equal([
        'temperature',
        'humidity',
        'pressure',
      ]);
    });

    it('should use default sensor classes when not specified', () => {
      const config: Config = {
        area: 'living_room',
      };

      getSensors(mockHass, config);

      const [, sensorClasses] = calculateAveragesStub.firstCall.args;
      expect(sensorClasses).to.deep.equal(['temperature', 'humidity']);
    });

    it('should return config sensors in individual array', () => {
      const config: Config = {
        area: 'living_room',
        sensors: ['sensor.custom_sensor_2', 'sensor.custom_sensor_1'],
      };

      const result = getSensors(mockHass, config);

      expect(result.individual).to.have.lengthOf(2);
      expect(result.individual[0]!.entity_id).to.equal(
        'sensor.custom_sensor_2',
      );
      expect(result.individual[1]!.entity_id).to.equal(
        'sensor.custom_sensor_1',
      );
    });

    it('should exclude sensors from other areas', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [],
      };

      const result = getSensors(mockHass, config);

      // Should not include the kitchen sensor
      expect(result.individual.map((s) => s.entity_id)).to.not.include(
        'sensor.other_area_temp', // This is in kitchen area
      );
    });

    it('should exclude sensors from other areas unless configured', () => {
      const config: Config = {
        area: 'living_room',
        sensors: ['sensor.other_area_temp'], // This is in kitchen area
      };

      const result = getSensors(mockHass, config);

      // Should not include the kitchen sensor
      expect(result.individual.map((s) => s.entity_id)).to.include(
        'sensor.other_area_temp',
      );
    });

    it('should skip default entities when exclude_default_entities is enabled', () => {
      const config: Config = {
        area: 'living_room',
        features: ['exclude_default_entities'],
      };

      getSensors(mockHass, config);

      const [classSensors] = calculateAveragesStub.firstCall.args;
      expect(classSensors).to.have.lengthOf(0);
    });

    it('should still include config sensors when exclude_default_entities is enabled', () => {
      const config: Config = {
        area: 'living_room',
        features: ['exclude_default_entities'],
        sensors: ['sensor.custom_sensor_1'],
      };

      const result = getSensors(mockHass, config);

      expect(result.individual).to.have.lengthOf(1);
      expect(result.individual[0]!.entity_id).to.equal(
        'sensor.custom_sensor_1',
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

      expect(result.individual.map((s) => s.entity_id)).to.include(
        'sensor.device_area_sensor',
      );
    });

    it('should handle missing entities gracefully', () => {
      const config: Config = {
        area: 'living_room',
        sensors: [
          'sensor.living_room_temperature',
          'sensor.nonexistent_sensor', // This doesn't exist
        ],
      };

      const result = getSensors(mockHass, config);

      // Should include only the existing sensor
      expect(result.individual).to.have.lengthOf(1);
      expect(result.individual[0]!.entity_id).to.equal(
        'sensor.living_room_temperature',
      );
    });

    it('should return empty arrays when no matching sensors found', () => {
      const config: Config = {
        area: 'empty_area',
      };

      const result = getSensors(mockHass, config);

      expect(result.individual).to.be.an('array');
      expect(result.individual).to.have.lengthOf(0);
      expect(result.averaged).to.be.an('array');
    });
  });
};
