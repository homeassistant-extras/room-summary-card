import {
  computeStateName,
  computeStateNameFromEntityAttributes,
} from '@hass/common/entity/compute_state_name';
import { expect } from 'chai';

describe('compute_state_name.ts', () => {
  describe('computeStateNameFromEntityAttributes', () => {
    it('should return friendly_name when available', () => {
      const attributes = { friendly_name: 'Living Room Light' };
      expect(
        computeStateNameFromEntityAttributes('light.living_room', attributes),
      ).to.equal('Living Room Light');

      const attributes2 = { friendly_name: 'Kitchen Temperature' };
      expect(
        computeStateNameFromEntityAttributes(
          'sensor.kitchen_temp',
          attributes2,
        ),
      ).to.equal('Kitchen Temperature');
    });

    it('should convert entity ID to readable name when no friendly_name', () => {
      const attributes = {};
      expect(
        computeStateNameFromEntityAttributes('light.living_room', attributes),
      ).to.equal('living room');

      const attributes2 = { friendly_name: undefined };
      expect(
        computeStateNameFromEntityAttributes(
          'sensor.kitchen_temperature',
          attributes2,
        ),
      ).to.equal('kitchen temperature');
    });

    it('should handle entity IDs with multiple underscores', () => {
      const attributes = {};
      expect(
        computeStateNameFromEntityAttributes(
          'sensor.outdoor_temperature_humidity',
          attributes,
        ),
      ).to.equal('outdoor temperature humidity');

      const attributes2 = {};
      expect(
        computeStateNameFromEntityAttributes(
          'binary_sensor.front_door_contact',
          attributes2,
        ),
      ).to.equal('front door contact');
    });

    it('should convert friendly_name to string', () => {
      const attributes = { friendly_name: 123 };
      expect(
        computeStateNameFromEntityAttributes('sensor.test', attributes),
      ).to.equal('123');

      const attributes2 = { friendly_name: null };
      expect(
        computeStateNameFromEntityAttributes('sensor.test', attributes2),
      ).to.equal('');
    });
  });

  describe('computeStateName', () => {
    it('should compute state name from HassEntity object', () => {
      const stateObj = {
        entity_id: 'light.living_room',
        attributes: { friendly_name: 'Living Room Light' },
      } as any;

      expect(computeStateName(stateObj)).to.equal('Living Room Light');
    });

    it('should fall back to entity ID conversion when no friendly_name', () => {
      const stateObj = {
        entity_id: 'sensor.kitchen_temperature',
        attributes: {},
      } as any;

      expect(computeStateName(stateObj)).to.equal('kitchen temperature');
    });
  });
});
