import { sensorDataToDisplaySensors } from '@delegates/utils/sensor-utils';
import { createStateEntity as e } from '@test/test-helpers';
import type { AveragedSensor, SensorData } from '@type/config';
import { expect } from 'chai';

export default () => {
  describe('sensor-data-converter.ts', () => {
    describe('sensorDataToDisplaySensors', () => {
      it('should convert individual sensors to display sensors', () => {
        const sensorData: SensorData = {
          individual: [
            e('sensor', 'temperature', '72.5', {
              device_class: 'temperature',
              unit_of_measurement: '°F',
            }),
            e('sensor', 'humidity', '45', {
              device_class: 'humidity',
              unit_of_measurement: '%',
            }),
          ],
          averaged: [],
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result).to.have.lengthOf(2);
        expect(result[0]).to.deep.include({
          domain: 'sensor',
          device_class: 'temperature',
        });
        expect(result[0]!.state!.entity_id).to.equal('sensor.temperature');
        expect(result[1]!.device_class).to.equal('humidity');
      });

      it('should convert averaged sensors with proper formatting', () => {
        const averagedTemp: AveragedSensor = {
          device_class: 'temperature',
          average: 73.25,
          uom: '°F',
          states: [],
          domain: 'sensor',
        };

        const sensorData: SensorData = {
          individual: [],
          averaged: [averagedTemp],
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.deep.include({
          value: '73.3°F',
          device_class: 'temperature',
          domain: 'sensor',
        });
      });

      it('should format numbers correctly removing trailing zeros', () => {
        const averagedSensors: AveragedSensor[] = [
          {
            device_class: 'temperature',
            average: 75.0,
            uom: '°F',
            states: [],
            domain: 'sensor',
          },
          {
            device_class: 'pressure',
            average: 1013.67,
            uom: 'hPa',
            states: [],
            domain: 'sensor',
          },
        ];

        const sensorData: SensorData = {
          individual: [],
          averaged: averagedSensors,
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result[0]!.value).to.equal('75°F');
        expect(result[1]!.value).to.equal('1013.7 hPa');
      });

      it('should handle units with and without spacing correctly', () => {
        const averagedSensors: AveragedSensor[] = [
          {
            device_class: 'temperature',
            average: 22.5,
            uom: '°C',
            states: [],
            domain: 'sensor',
          },
          {
            device_class: 'humidity',
            average: 45.0,
            uom: '%',
            states: [],
            domain: 'sensor',
          },
          {
            device_class: 'pressure',
            average: 1013.2,
            uom: 'hPa',
            states: [],
            domain: 'sensor',
          },
        ];

        const sensorData: SensorData = {
          individual: [],
          averaged: averagedSensors,
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result[0]!.value).to.equal('22.5°C'); // No space before °C
        expect(result[1]!.value).to.equal('45%'); // No space before %
        expect(result[2]!.value).to.equal('1013.2 hPa'); // Space before hPa
      });

      it('should order individual sensors before averaged sensors', () => {
        const sensorData: SensorData = {
          individual: [
            e('sensor', 'living_room_temp', '72', {
              device_class: 'temperature',
            }),
          ],
          averaged: [
            {
              device_class: 'humidity',
              average: 50.0,
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result).to.have.lengthOf(2);
        expect(result[0]!.state!.entity_id).to.equal('sensor.living_room_temp');
        expect(result[1]!.value).to.equal('50%');
      });

      it('should handle sensors without device_class', () => {
        const sensorData: SensorData = {
          individual: [
            e('sensor', 'custom', '100', {
              unit_of_measurement: 'units',
            }),
          ],
          averaged: [],
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result[0]!.device_class).to.equal('sensor');
      });

      it('should handle empty sensor data', () => {
        const sensorData: SensorData = {
          individual: [],
          averaged: [],
        };

        const result = sensorDataToDisplaySensors(sensorData);

        expect(result).to.have.lengthOf(0);
      });
    });
  });
};
