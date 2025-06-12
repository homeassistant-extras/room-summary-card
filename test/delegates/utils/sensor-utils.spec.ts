import { sensorDataToDisplaySensors } from '@delegates/utils/sensor-utils';
import type { AveragedSensor } from '@type/sensor';
import { expect } from 'chai';

export default () => {
  describe('sensor-utils.ts', () => {
    describe('sensorDataToDisplaySensors', () => {
      it('should format temperature with no space before unit', () => {
        const sensor: AveragedSensor = {
          device_class: 'temperature',
          average: 22.5,
          uom: '°C',
          states: [],
          domain: 'sensor',
        };

        const result = sensorDataToDisplaySensors(sensor);
        expect(result).to.equal('22.5°C');
      });

      it('should format humidity with no space before unit', () => {
        const sensor: AveragedSensor = {
          device_class: 'humidity',
          average: 45.0,
          uom: '%',
          states: [],
          domain: 'sensor',
        };

        const result = sensorDataToDisplaySensors(sensor);
        expect(result).to.equal('45%');
      });

      it('should format pressure with space before unit', () => {
        const sensor: AveragedSensor = {
          device_class: 'pressure',
          average: 1013.2,
          uom: 'hPa',
          states: [],
          domain: 'sensor',
        };

        const result = sensorDataToDisplaySensors(sensor);
        expect(result).to.equal('1013.2 hPa');
      });

      it('should remove trailing zeros from decimal values', () => {
        const sensor: AveragedSensor = {
          device_class: 'temperature',
          average: 75.0,
          uom: '°F',
          states: [],
          domain: 'sensor',
        };

        const result = sensorDataToDisplaySensors(sensor);
        expect(result).to.equal('75°F');
      });

      it('should format decimal values correctly', () => {
        const sensor: AveragedSensor = {
          device_class: 'pressure',
          average: 1013.67,
          uom: 'hPa',
          states: [],
          domain: 'sensor',
        };

        const result = sensorDataToDisplaySensors(sensor);
        expect(result).to.equal('1013.7 hPa');
      });
    });
  });
};
