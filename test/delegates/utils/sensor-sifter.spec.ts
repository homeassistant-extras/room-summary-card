import { probablyClassSensorUsersMadeThisComplex } from '@delegates/utils/sensor-sifter';
import type { AreaRegistryEntry } from '@hass/data/area/area_registry';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('sensor-sifter.ts', () => {
  const defaultConfig: Config = { area: 'living_room' };
  const defaultClasses = ['temperature', 'humidity', 'illuminance'];

  const area: AreaRegistryEntry = {
    area_id: 'living_room',
    name: 'Living Room',
    icon: 'mdi:sofa',
    picture: null,
  };

  describe('exclude_default_entities', () => {
    it('should return false when exclude_default_entities is enabled', () => {
      const config: Config = {
        ...defaultConfig,
        features: ['exclude_default_entities'],
      };
      const state = e('sensor', 'temp', '72', { device_class: 'temperature' });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          config,
          area,
          defaultClasses,
        ),
      ).to.be.false;
    });
  });

  describe('domain and device class filtering', () => {
    it('should return false for non-sensor domains', () => {
      const state = e('binary_sensor', 'motion', 'on', {
        device_class: 'motion',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          area,
          defaultClasses,
        ),
      ).to.be.false;
    });

    it('should return false when device_class is missing', () => {
      const state = e('sensor', 'custom', '42');

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          area,
          defaultClasses,
        ),
      ).to.be.false;
    });

    it('should return false when device_class is not in sensorClasses', () => {
      const state = e('sensor', 'pressure', '1013', {
        device_class: 'pressure',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          area,
          defaultClasses,
        ),
      ).to.be.false;
    });

    it('should return true for a sensor with a matching device_class', () => {
      const state = e('sensor', 'temp', '72', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          area,
          defaultClasses,
        ),
      ).to.be.true;
    });

    it('should return true for illuminance sensor', () => {
      const state = e('sensor', 'lux', '500', {
        device_class: 'illuminance',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          area,
          defaultClasses,
        ),
      ).to.be.true;
    });
  });

  describe('area default sensor logic', () => {
    const areaWithDefaults: AreaRegistryEntry = {
      ...area,
      temperature_entity_id: 'sensor.area_temp',
      humidity_entity_id: 'sensor.area_humidity',
    };

    it('should return true for the area default temperature sensor', () => {
      const state = e('sensor', 'area_temp', '72', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaWithDefaults,
          defaultClasses,
        ),
      ).to.be.true;
    });

    it('should return true for the area default humidity sensor', () => {
      const state = e('sensor', 'area_humidity', '45', {
        device_class: 'humidity',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaWithDefaults,
          defaultClasses,
        ),
      ).to.be.true;
    });

    it('should return false for a non-default temperature sensor when area has a default', () => {
      const state = e('sensor', 'other_temp', '68', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaWithDefaults,
          defaultClasses,
        ),
      ).to.be.false;
    });

    it('should return false for a non-default humidity sensor when area has a default', () => {
      const state = e('sensor', 'other_humidity', '50', {
        device_class: 'humidity',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaWithDefaults,
          defaultClasses,
        ),
      ).to.be.false;
    });

    it('should still return true for illuminance when area has temp/humidity defaults', () => {
      const state = e('sensor', 'lux', '500', {
        device_class: 'illuminance',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaWithDefaults,
          defaultClasses,
        ),
      ).to.be.true;
    });
  });

  describe('partial area defaults', () => {
    it('should allow non-default temp sensors when area only has humidity default', () => {
      const areaHumidityOnly: AreaRegistryEntry = {
        ...area,
        humidity_entity_id: 'sensor.area_humidity',
      };
      const state = e('sensor', 'any_temp', '72', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaHumidityOnly,
          defaultClasses,
        ),
      ).to.be.true;
    });

    it('should allow non-default humidity sensors when area only has temp default', () => {
      const areaTempOnly: AreaRegistryEntry = {
        ...area,
        temperature_entity_id: 'sensor.area_temp',
      };
      const state = e('sensor', 'any_humidity', '45', {
        device_class: 'humidity',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          areaTempOnly,
          defaultClasses,
        ),
      ).to.be.true;
    });
  });

  describe('undefined area', () => {
    it('should return true for matching sensors when area is undefined', () => {
      const state = e('sensor', 'temp', '72', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(
          state,
          defaultConfig,
          undefined,
          defaultClasses,
        ),
      ).to.be.true;
    });
  });

  describe('custom sensor classes', () => {
    it('should respect a custom sensorClasses list', () => {
      const state = e('sensor', 'pressure', '1013', {
        device_class: 'pressure',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(state, defaultConfig, area, [
          'pressure',
        ]),
      ).to.be.true;
    });

    it('should reject temperature when not in custom sensorClasses', () => {
      const state = e('sensor', 'temp', '72', {
        device_class: 'temperature',
      });

      expect(
        probablyClassSensorUsersMadeThisComplex(state, defaultConfig, area, [
          'pressure',
        ]),
      ).to.be.false;
    });
  });
});
