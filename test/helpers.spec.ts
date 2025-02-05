import { expect } from 'chai';
import { getIconEntities, getProblemEntities, getState } from '../src/helpers';
import type { HomeAssistant } from '../src/types/homeassistant';

describe('helpers.ts', () => {
  let mockHass: Partial<HomeAssistant>;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.test_room': {
          entity_id: 'light.test_room',
          state: 'on',
          attributes: {},
          getDomain: () => 'light',
        },
      },
      entities: {
        'light.test_room': {
          device_id: 'device_1',
          area_id: 'area_1',
          labels: [],
        },
      },
      devices: {
        device_1: {
          area_id: 'area_1',
        },
      },
      areas: {
        area_1: {
          area_id: 'area_1',
          icon: 'mdi:home',
        },
      },
    };
  });

  describe('getState', () => {
    it('should return undefined for missing entity', () => {
      expect(getState(mockHass as HomeAssistant, 'light.missing')).to.be
        .undefined;
    });

    it('should return state for existing entity', () => {
      const state = getState(mockHass as HomeAssistant, 'light.test_room');
      expect(state).to.exist;
      expect(state?.state).to.equal('on');
    });

    it('should create fake state when requested', () => {
      const state = getState(mockHass as HomeAssistant, 'light.fake', true);
      expect(state).to.exist;
      expect(state?.entity_id).to.equal('light.fake');
    });
  });

  describe('getIconEntities', () => {
    it('should return configured entities', () => {
      const config = {
        area: 'test_room',
        entities: ['light.test_room'],
      };

      const entities = getIconEntities(mockHass as HomeAssistant, config);
      expect(entities).to.have.lengthOf(1);
      expect(entities[0]!.config.entity_id).to.equal('light.test_room');
    });

    it('should handle climate entities', () => {
      mockHass.states!['climate.test'] = {
        entity_id: 'climate.test',
        state: 'heat',
        attributes: {},
        getDomain: () => 'climate',
      };

      const config = {
        area: 'test_room',
        entities: ['climate.test'],
        skip_climate_colors: false,
      };

      const entities = getIconEntities(mockHass as HomeAssistant, config);
      expect(entities[0]!.state!.attributes.on_color).to.exist;
    });
  });

  describe('getProblemEntities', () => {
    it('should identify problems in area', () => {
      mockHass.entities!['sensor.problem'] = {
        area_id: 'area_1',
        labels: ['problem'],
        device_id: 'device_1',
      };
      mockHass.states!['sensor.problem'] = {
        state: 'on',
        entity_id: 'sensor.problem',
        attributes: {},
        getDomain: () => 'sensor',
      };

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass as HomeAssistant,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.true;
    });
  });
});
