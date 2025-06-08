import { getProblemEntities } from '@delegates/entities/problem-entities';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import { expect } from 'chai';

export default () => {
  describe('card-entities.ts', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      mockHass = {
        states: {
          'light.test': e('light', 'test'),
          'light.test_room_light': e('light', 'test_room_light', 'on'),
          'switch.test_room_fan': e('switch', 'test_room_fan', 'off'),
        },
        entities: {
          'light.test': {
            device_id: 'device_1',
            area_id: 'area_1',
            labels: [],
          },
          'light.test_room_light': {
            device_id: 'device_2',
            area_id: 'test_room',
            labels: [],
          },
          'switch.test_room_fan': {
            device_id: 'device_3',
            area_id: 'test_room',
            labels: [],
          },
        },
        devices: {
          device_1: {
            area_id: 'area_1',
          },
          device_2: {
            area_id: 'test_room',
          },
          device_3: {
            area_id: 'test_room',
          },
        },
        areas: {
          area_1: {
            area_id: 'area_1',
            icon: 'mdi:home',
          },
          test_room: {
            area_id: 'test_room',
            icon: 'mdi:room',
          },
        },
      } as any;
    });

    it('should identify problems in area', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: 'area_1',
        labels: ['problem'],
        device_id: 'device_1',
      };
      mockHass.states['sensor.problem'] = e('sensor', 'problem');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.true;
    });

    it('should check device area when entity has no area', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: '', // No direct area
        labels: ['problem'],
        device_id: 'device_1', // But device is in area_1
      };
      mockHass.states['sensor.problem'] = e('sensor', 'problem');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.true;
    });

    it('should not identify entities without problem label', () => {
      mockHass.entities['sensor.normal'] = {
        entity_id: 'sensor.normal',
        area_id: 'area_1',
        labels: ['non-problem'], // Not a problem
        device_id: 'device_1',
      };
      mockHass.states['sensor.normal'] = e('sensor', 'normal');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.not.include('sensor.normal');
      expect(problemExists).to.be.false;
    });

    it('should not identify problem entities from other areas', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: 'area_2', // Different area
        labels: ['problem'],
        device_id: 'device_4', // Device in different area
      };
      mockHass.devices['device_4'] = {
        area_id: 'area_2', // Different area
      };
      mockHass.states['sensor.problem'] = e('sensor', 'problem');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.not.include('sensor.problem');
      expect(problemExists).to.be.false;
    });

    it('should identify active problem entities', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: 'area_1',
        labels: ['problem'],
        device_id: 'device_1',
      };
      // Create an active problem entity (state 'on')
      mockHass.states['sensor.problem'] = e('sensor', 'problem', 'on');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.true;
    });

    it('should not flag inactive problem entities as active problems', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: 'area_1',
        labels: ['problem'],
        device_id: 'device_1',
      };
      // Create an inactive problem entity (state 'off')
      mockHass.states['sensor.problem'] = e('sensor', 'problem', 'off');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.false; // problemExists should be false
    });

    it('should handle missing entity states gracefully', () => {
      mockHass.entities['sensor.problem'] = {
        entity_id: 'sensor.problem',
        area_id: 'area_1',
        labels: ['problem'],
        device_id: 'device_1',
      };
      // Don't add a state for this entity

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.false;
    });
  });
};
