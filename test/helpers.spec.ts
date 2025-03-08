import {
  getIconEntities,
  getProblemEntities,
  getRoomEntity,
  getState,
} from '@/helpers';
import type { Config } from '@/types/config';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import { expect } from 'chai';

describe('helpers.ts', () => {
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

  describe('getState', () => {
    it('should return undefined for missing entity', () => {
      expect(getState(mockHass, 'light.missing')).to.be.undefined;
    });

    it('should return state for existing entity', () => {
      const state = getState(mockHass, 'light.test');
      expect(state).to.exist;
      expect(state?.state).to.equal('on');
    });

    it('should create fake state when requested', () => {
      const state = getState(mockHass, 'light.fake', true);
      expect(state).to.exist;
      expect(state?.entity_id).to.equal('light.fake');
    });

    it('should return state with domain and isActive functions', () => {
      const result = getState(mockHass, 'light.test');
      expect(result).to.include.keys('domain', 'isActive');
      expect(result?.domain).to.equal('light');
      expect(result?.isActive).to.be.true;
    });

    it('should return correct domain from domain function', () => {
      const result = getState(mockHass, 'light.test');
      expect(result?.domain).to.equal('light');
    });

    it('should return true from isActive function if state is "on"', () => {
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.true;
    });

    it('should return true from isActive function if state is "true"', () => {
      mockHass.states!['light.test']!.state = 'true';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.true;
    });

    it('should return true from isActive function if state is "True" case insensitive', () => {
      mockHass.states!['light.test']!.state = 'TruE';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.true;
    });

    it('should return false from isActive function if state is "off"', () => {
      mockHass.states!['light.test']!.state = 'off';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.false;
    });

    it('should return true from isActive function if state is a positive number', () => {
      mockHass.states!['light.test']!.state = '1';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.true;
    });

    it('should return false from isActive function if state is a negative number', () => {
      mockHass.states!['light.test']!.state = '-1';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive).to.be.false;
    });
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

    it('should handle climate entities and skip_climate_colors', () => {
      mockHass.states!['climate.test'] = e('climate', 'test', 'heat');
      mockHass.entities!['climate.test'] = {
        device_id: 'device_1',
        area_id: 'area_1',
        labels: [],
      };

      const configWithColors = {
        area: 'test_room',
        entities: ['climate.test'],
      };

      const entitiesWithColors = getIconEntities(
        mockHass as HomeAssistant,
        configWithColors,
      );
      expect(entitiesWithColors[2]!.state!.attributes!.on_color).to.exist;

      const configWithoutColors = {
        area: 'test_room',
        entities: ['climate.test'],
        features: ['skip_climate_colors'],
      };

      const entitiesWithoutColors = getIconEntities(
        mockHass as HomeAssistant,
        configWithoutColors as Config,
      );
      expect(entitiesWithoutColors[2]!.state!.attributes!.on_color).to.be
        .undefined;
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

  describe('getRoomEntity', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      mockHass = {
        states: {
          'light.test_room_light': e('light', 'test_room_light', 'on'),
          'light.custom_entity': e('light', 'custom_entity', 'off'),
        },
        entities: {
          'light.test_room_light': {
            device_id: 'device_1',
            area_id: 'test_room',
            labels: [],
          },
          'light.custom_entity': {
            device_id: 'device_2',
            area_id: 'custom_area',
            labels: [],
          },
        },
        devices: {
          device_1: {
            area_id: 'test_room',
          },
          device_2: {
            area_id: 'custom_area',
          },
        },
        areas: {
          test_room: {
            area_id: 'test_room',
            icon: 'mdi:room',
          },
          custom_area: {
            area_id: 'custom_area',
            icon: 'mdi:custom',
          },
        },
      } as any as HomeAssistant;
    });

    it('should return default room entity when no custom entity specified', () => {
      const config: Config = {
        area: 'test_room',
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.entity_id).to.equal('light.test_room_light');
      expect(roomEntity.config.icon).to.equal('mdi:room');
      expect(roomEntity.config.tap_action?.action).to.equal('navigate');
      expect(roomEntity.config.hold_action?.action).to.equal('more-info');
      expect(roomEntity.config.double_tap_action?.action).to.equal('none');
      expect(roomEntity.state?.state).to.equal('on');
    });

    it('should use custom navigation path when specified', () => {
      const config: Config = {
        area: 'test_room',
        navigate: 'custom-path',
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.tap_action?.action).to.equal('navigate');
    });

    it('should return room entity with string entity configuration', () => {
      const config: Config = {
        area: 'test_room',
        entity: 'light.custom_entity',
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
      expect(roomEntity.state?.state).to.equal('off');
      expect(roomEntity.config.hold_action?.action).to.equal('more-info');
      expect(roomEntity.config.double_tap_action?.action).to.equal('none');
    });

    it('should return room entity with object entity configuration', () => {
      const config: Config = {
        area: 'test_room',
        entity: {
          entity_id: 'light.custom_entity',
          icon: 'mdi:override',
          tap_action: {
            action: 'toggle',
          },
        },
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
      expect(roomEntity.config.icon).to.equal('mdi:override');
      expect(roomEntity.config.tap_action?.action).to.equal('toggle');
      expect(roomEntity.config.hold_action?.action).to.equal('more-info');
      expect(roomEntity.config.double_tap_action?.action).to.equal('none');
      expect(roomEntity.state?.state).to.equal('off');
    });

    it('should handle non-existent entity gracefully by creating fake state', () => {
      const config: Config = {
        area: 'non_existent_room',
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.entity_id).to.equal(
        'light.non_existent_room_light',
      );
      expect(roomEntity.state?.entity_id).to.equal(
        'light.non_existent_room_light',
      );
      // Verify it's a fake state by checking if attributes is undefined
      expect(roomEntity.state?.attributes).to.be.undefined;
    });

    it('should preserve custom entity config with defaults', () => {
      const config: Config = {
        area: 'test_room',
        entity: {
          entity_id: 'light.custom_entity',
          icon: 'icon',
          // Intentionally omitting hold_action and double_tap_action
        },
      };

      const roomEntity = getRoomEntity(mockHass, config);

      expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
      expect(roomEntity.config.icon).to.equal('icon');
      // Should have defaults for these
      expect(roomEntity.config.hold_action?.action).to.equal('more-info');
      expect(roomEntity.config.double_tap_action?.action).to.equal('none');
    });
  });
});
