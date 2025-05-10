import type { Config } from '@/types/config';
import {
  getIconEntities,
  getProblemEntities,
} from '@delegates/utils/card-entities';
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
      } as any as HomeAssistant;
    });

    describe('getIconEntities', () => {
      it('should return configured entities', () => {
        const config = {
          area: 'test_room',
          entities: ['light.test'],
        };

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        expect(entities).to.have.lengthOf(3); // Base entities + configured entity
        expect(entities[2]!.config.entity_id).to.equal('light.test');
      });

      it('should return base entities by default', () => {
        const config = {
          area: 'test_room',
        };

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        expect(entities).to.have.lengthOf(2);
        expect(entities[0]!.config.entity_id).to.equal('light.test_room_light');
        expect(entities[1]!.config.entity_id).to.equal('switch.test_room_fan');
      });

      it('should not return base entities when exclude_default_entities is set', () => {
        const config = {
          area: 'test_room',
          features: ['exclude_default_entities'],
          entities: ['light.test'],
        } as any as Config;

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        expect(entities).to.have.lengthOf(1);
        expect(entities[0]!.config.entity_id).to.equal('light.test');
      });

      it('should handle missing base entities gracefully', () => {
        const config = {
          area: 'nonexistent_room',
        };

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        expect(entities).to.have.lengthOf(0);
      });

      it('should handle entity config objects', () => {
        const config = {
          area: 'test_room',
          entities: [
            {
              entity_id: 'light.test',
              icon: 'mdi:custom',
              tap_action: { action: 'custom' },
            },
          ],
        } as any as Config;

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        expect(entities).to.have.lengthOf(3);
        expect(entities[2]!.config.icon).to.equal('mdi:custom');
        expect(entities[2]!.config.tap_action!.action).to.equal('custom');
      });

      it('should merge default actions with entity config', () => {
        const config = {
          area: 'test_room',
          entities: [
            {
              entity_id: 'light.test',
              tap_action: { action: 'custom' },
            },
          ],
        } as any as Config;

        const entities = getIconEntities(mockHass as HomeAssistant, config);
        const customEntity = entities[2]!;
        expect(customEntity.config.tap_action!.action).to.equal('custom');
        expect(customEntity.config.hold_action!.action).to.equal('more-info');
        expect(customEntity.config.double_tap_action!.action).to.equal('none');
      });
    });

    describe('getProblemEntities', () => {
      it('should identify problems in area', () => {
        mockHass.entities!['sensor.problem'] = {
          area_id: 'area_1',
          labels: ['problem'],
          device_id: 'device_1',
        };
        mockHass.states!['sensor.problem'] = e('sensor', 'problem');

        const { problemEntities, problemExists } = getProblemEntities(
          mockHass as HomeAssistant,
          'area_1',
        );
        expect(problemEntities).to.include('sensor.problem');
        expect(problemExists).to.be.true;
      });
    });
  });
};
