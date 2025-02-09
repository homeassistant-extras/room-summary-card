import { expect } from 'chai';
import { getIconEntities, getProblemEntities, getState } from '../src/helpers';
import type { HomeAssistant } from '../src/types/homeassistant';
import { createStateEntity as s } from './test-helpers';

describe('helpers.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.test': s('light', 'test'),
      },
      entities: {
        'light.test': {
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

    it('should return state with getDomain and isActive functions', () => {
      const result = getState(mockHass, 'light.test');
      expect(result).to.include.keys('getDomain', 'isActive');
      expect(result?.getDomain()).to.equal('light');
      expect(result?.isActive()).to.be.true;
    });

    it('should return correct domain from getDomain function', () => {
      const result = getState(mockHass, 'light.test');
      expect(result?.getDomain()).to.equal('light');
    });

    it('should return true from isActive function if state is "on"', () => {
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.true;
    });

    it('should return true from isActive function if state is "true"', () => {
      mockHass.states!['light.test']!.state = 'true';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.true;
    });

    it('should return true from isActive function if state is "True" case insensitive', () => {
      mockHass.states!['light.test']!.state = 'TruE';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.true;
    });

    it('should return false from isActive function if state is "off"', () => {
      mockHass.states!['light.test']!.state = 'off';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.false;
    });

    it('should return true from isActive function if state is a positive number', () => {
      mockHass.states!['light.test']!.state = '1';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.true;
    });

    it('should return false from isActive function if state is a negative number', () => {
      mockHass.states!['light.test']!.state = '-1';
      const result = getState(mockHass, 'light.test');
      expect(result?.isActive()).to.be.false;
    });
  });

  describe('getIconEntities', () => {
    it('should return configured entities', () => {
      const config = {
        area: 'test_room',
        entities: ['light.test'],
      };

      const entities = getIconEntities(mockHass as HomeAssistant, config);
      expect(entities).to.have.lengthOf(1);
      expect(entities[0]!.config.entity_id).to.equal('light.test');
    });

    it('should handle climate entities', () => {
      mockHass.states!['climate.test'] = s('climate', 'test', 'heat');

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
      mockHass.states!['sensor.problem'] = s('sensor', 'problem');

      const { problemEntities, problemExists } = getProblemEntities(
        mockHass as HomeAssistant,
        'area_1',
      );
      expect(problemEntities).to.include('sensor.problem');
      expect(problemExists).to.be.true;
    });
  });
});
