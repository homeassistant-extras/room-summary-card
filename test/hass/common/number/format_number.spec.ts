import {
  isNumericFromAttributes,
  isNumericState,
} from '@hass/common/number/format_number';
import type { HassEntity } from '@hass/ws/types';
import { expect } from 'chai';

export default () => {
  describe('format_number.ts', () => {
    // Helper function to create state objects for testing
    const createStateObj = (
      entityId: string,
      state: string,
      attributes = {},
    ): HassEntity => ({
      entity_id: entityId,
      state,
      attributes,
    });

    describe('isNumericState', () => {
      it('should return true for entity with unit_of_measurement', () => {
        const stateObj = createStateObj('sensor.temperature', '72', {
          unit_of_measurement: '°F',
        });

        expect(isNumericState(stateObj)).to.be.true;
      });

      it('should return true for entity with state_class', () => {
        const stateObj = createStateObj('sensor.energy', '100', {
          state_class: 'total_increasing',
        });

        expect(isNumericState(stateObj)).to.be.true;
      });

      it('should return false for entity without numeric attributes', () => {
        const stateObj = createStateObj('light.living_room', 'on', {
          friendly_name: 'Living Room Light',
        });

        expect(isNumericState(stateObj)).to.be.false;
      });

      it('should return false for entity with empty attributes', () => {
        const stateObj = createStateObj('switch.test', 'off', {});

        expect(isNumericState(stateObj)).to.be.false;
      });
    });

    describe('isNumericFromAttributes', () => {
      it('should return true when unit_of_measurement is present', () => {
        const attributes = {
          unit_of_measurement: 'kWh',
          friendly_name: 'Energy Sensor',
        };

        expect(isNumericFromAttributes(attributes)).to.be.true;
      });

      it('should return true when state_class is present', () => {
        const attributes = {
          state_class: 'measurement',
          friendly_name: 'Power Sensor',
        };

        expect(isNumericFromAttributes(attributes)).to.be.true;
      });

      it('should return true when device_class matches numericDeviceClasses', () => {
        const attributes = {
          device_class: 'temperature',
          friendly_name: 'Temperature Sensor',
        };
        const numericDeviceClasses = ['temperature', 'humidity', 'pressure'];

        expect(isNumericFromAttributes(attributes, numericDeviceClasses)).to.be
          .true;
      });

      it('should return false when device_class does not match numericDeviceClasses', () => {
        const attributes = {
          device_class: 'motion',
          friendly_name: 'Motion Sensor',
        };
        const numericDeviceClasses = ['temperature', 'humidity'];

        expect(isNumericFromAttributes(attributes, numericDeviceClasses)).to.be
          .false;
      });

      it('should return false when no numeric attributes are present', () => {
        const attributes = {
          friendly_name: 'Binary Sensor',
          icon: 'mdi:motion-sensor',
        };

        expect(isNumericFromAttributes(attributes)).to.be.false;
      });

      it('should return false when device_class is undefined', () => {
        const attributes = {
          friendly_name: 'Test Sensor',
        };
        const numericDeviceClasses = ['temperature', 'humidity'];

        expect(isNumericFromAttributes(attributes, numericDeviceClasses)).to.be
          .false;
      });

      it('should handle multiple numeric indicators', () => {
        const attributes = {
          unit_of_measurement: '°C',
          state_class: 'measurement',
          device_class: 'temperature',
        };
        const numericDeviceClasses = ['temperature'];

        expect(isNumericFromAttributes(attributes, numericDeviceClasses)).to.be
          .true;
      });

      it('should handle empty numericDeviceClasses array', () => {
        const attributes = {
          device_class: 'temperature',
        };
        const numericDeviceClasses: string[] = [];

        expect(isNumericFromAttributes(attributes, numericDeviceClasses)).to.be
          .false;
      });

      it('should handle undefined numericDeviceClasses', () => {
        const attributes = {
          device_class: 'temperature',
        };

        expect(isNumericFromAttributes(attributes)).to.be.false;
      });
    });
  });
};
