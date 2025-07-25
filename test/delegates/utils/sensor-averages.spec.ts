import { calculateAverages } from '@delegates/utils/sensor-averages';
import type { EntityState } from '@type/room';
import { expect } from 'chai';

// Helper to create entity states for testing
const createSensorEntity = (
  entityId: string,
  state: string,
  deviceClass: string,
  uom?: string,
): EntityState => ({
  entity_id: entityId,
  state,
  attributes: {
    device_class: deviceClass,
    unit_of_measurement: uom,
  },
  domain: 'sensor',
});

describe('calculate-averages.ts', () => {
  describe('calculateAverages', () => {
    it('should calculate averages for single device class with same UOM', () => {
      const entities = [
        createSensorEntity('sensor.temp1', '20', 'temperature', '°C'),
        createSensorEntity('sensor.temp2', '24', 'temperature', '°C'),
        createSensorEntity('sensor.temp3', '22', 'temperature', '°C'),
      ];

      const result = calculateAverages(entities, ['temperature']);

      expect(result).to.have.lengthOf(1);
      expect(result[0]!.average).to.equal(22);
      expect(result[0]!.device_class).to.equal('temperature');
      expect(result[0]!.uom).to.equal('°C');
      expect(result[0]!.states).to.have.lengthOf(3);
    });

    it('should group by different units of measurement', () => {
      const entities = [
        createSensorEntity('sensor.temp1', '20', 'temperature', '°C'),
        createSensorEntity('sensor.temp2', '68', 'temperature', '°F'),
        createSensorEntity('sensor.temp3', '25', 'temperature', '°C'),
      ];

      const result = calculateAverages(entities, ['temperature']);

      expect(result).to.have.lengthOf(2);

      const celsiusGroup = result.find((r) => r.uom === '°C');
      const fahrenheitGroup = result.find((r) => r.uom === '°F');

      expect(celsiusGroup?.average).to.equal(22.5);
      expect(fahrenheitGroup?.average).to.equal(68);
    });

    it('should handle multiple device classes', () => {
      const entities = [
        createSensorEntity('sensor.temp1', '20', 'temperature', '°C'),
        createSensorEntity('sensor.humidity1', '45', 'humidity', '%'),
        createSensorEntity('sensor.humidity2', '55', 'humidity', '%'),
      ];

      const result = calculateAverages(entities, ['temperature', 'humidity']);

      expect(result).to.have.lengthOf(2);

      const tempGroup = result.find((r) => r.device_class === 'temperature');
      const humidityGroup = result.find((r) => r.device_class === 'humidity');

      expect(tempGroup?.average).to.equal(20);
      expect(humidityGroup?.average).to.equal(50);
    });

    it('should return empty array when no matching entities', () => {
      const entities = [
        createSensorEntity('sensor.other1', '20', 'pressure', 'hPa'),
      ];

      const result = calculateAverages(entities, ['temperature']);

      expect(result).to.have.lengthOf(0);
    });

    it('should skip empty groups', () => {
      const entities = [
        createSensorEntity('sensor.pressure1', '1013', 'pressure', 'hPa'),
      ];

      const result = calculateAverages(entities, ['temperature', 'pressure']);

      expect(result).to.have.lengthOf(1);
      expect(result[0]!.device_class).to.equal('pressure');
    });

    it('should filter out entities with non-numeric states', () => {
      const entities = [
        createSensorEntity('sensor.temp1', '20', 'temperature', '°C'),
        createSensorEntity('sensor.temp2', 'unavailable', 'temperature', '°C'),
        createSensorEntity('sensor.temp3', 'unknown', 'temperature', '°C'),
        createSensorEntity('sensor.temp4', '24', 'temperature', '°C'),
        createSensorEntity('sensor.temp5', '', 'temperature', '°C'),
        createSensorEntity('sensor.temp6', 'NaN', 'temperature', '°C'),
      ];

      const result = calculateAverages(entities, ['temperature']);

      expect(result).to.have.lengthOf(1);
      expect(result[0]!.average).to.equal(22); // (20 + 24) / 2
      expect(result[0]!.states).to.have.lengthOf(2); // Only the 2 valid numeric entities
    });
  });
});
