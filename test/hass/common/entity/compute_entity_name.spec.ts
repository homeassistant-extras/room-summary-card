import {
  computeEntityEntryName,
  computeEntityName,
} from '@hass/common/entity/compute_entity_name';
import { expect } from 'chai';

describe('compute_entity_name.ts', () => {
  describe('computeEntityName', () => {
    it('should return state name when entity not in registry', () => {
      const stateObj = {
        entity_id: 'light.living_room',
        attributes: { friendly_name: 'Living Room Light' },
      } as any;

      const hass = {
        entities: {},
        states: {},
      } as any;

      expect(computeEntityName(stateObj, hass)).to.equal('Living Room Light');
    });

    it('should compute entity name from registry entry', () => {
      const stateObj = {
        entity_id: 'light.living_room',
        attributes: { friendly_name: 'Living Room Light' },
      } as any;

      const hass = {
        entities: {
          'light.living_room': {
            name: 'Living Room Light',
            device_id: 'device_123',
          },
        },
        devices: {
          device_123: {
            name: 'Living Room Device',
          },
        },
        states: {},
      } as any;

      expect(computeEntityName(stateObj, hass)).to.equal('Living Room Light');
    });
  });

  describe('computeEntityEntryName', () => {
    it('should return entity name when no device', () => {
      const entry = {
        name: 'Living Room Light',
        entity_id: 'light.living_room',
      } as any;

      const hass = {
        devices: {},
        states: {},
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal('Living Room Light');
    });

    it('should return state name when no entity name and device', () => {
      const entry = {
        entity_id: 'light.living_room',
      } as any;

      const hass = {
        devices: {},
        states: {
          'light.living_room': {
            entity_id: 'light.living_room',
            attributes: { friendly_name: 'Living Room Light' },
          },
        },
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal('Living Room Light');
    });

    it('should return entity name when entity name equals device name', () => {
      const entry = {
        name: 'Living Room Device',
        device_id: 'device_123',
      } as any;

      const hass = {
        devices: {
          device_123: {
            name: 'Living Room Device',
          },
        },
        states: {},
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal(
        'Living Room Device',
      );
    });

    it('should strip device name from entity name', () => {
      const entry = {
        name: 'Living Room Device Light',
        device_id: 'device_123',
      } as any;

      const hass = {
        devices: {
          device_123: {
            name: 'Living Room Device',
          },
        },
        states: {},
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal('Light');
    });

    it('should return entity name when device name cannot be stripped', () => {
      const entry = {
        name: 'Kitchen Light',
        device_id: 'device_123',
      } as any;

      const hass = {
        devices: {
          device_123: {
            name: 'Living Room Device',
          },
        },
        states: {},
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal('Kitchen Light');
    });

    it('should return device name when no entity name', () => {
      const entry = {
        device_id: 'device_123',
      } as any;

      const hass = {
        devices: {
          device_123: {
            name: 'Living Room Device',
          },
        },
        states: {},
      } as any;

      expect(computeEntityEntryName(entry, hass)).to.equal(
        'Living Room Device',
      );
    });
  });
});
