import {
  getStateColor,
  getStateResult,
  getThresholdColor,
  getThresholdResult,
} from '@theme/threshold-color';
import type { StateConfig, ThresholdConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';

describe('threshold-color.ts', () => {
  describe('getThresholdColor', () => {
    const createEntity = (
      state: string,
      thresholds?: ThresholdConfig[],
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        thresholds,
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no thresholds configured', () => {
      const entity = createEntity('25');
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          thresholds: [{ threshold: 50, icon_color: 'green' }],
        },
        state: undefined,
      };
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined for non-numeric states', () => {
      const entity = createEntity('unavailable', [
        { threshold: 50, icon_color: 'green' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should match threshold with default gte operator', () => {
      const entity = createEntity('75', [
        { threshold: 80, icon_color: 'green' },
        { threshold: 50, icon_color: 'orange' },
        { threshold: 20, icon_color: 'red' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('orange');
    });

    it('should match highest applicable threshold first', () => {
      const entity = createEntity('85', [
        { threshold: 80, icon_color: 'green' },
        { threshold: 50, icon_color: 'orange' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('green');
    });

    it('should work with gt operator', () => {
      const entity = createEntity('25', [
        { threshold: 25, icon_color: 'red', operator: 'gt' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined; // 25 is not > 25

      const entity2 = createEntity('26', [
        { threshold: 25, icon_color: 'red', operator: 'gt' },
      ]);
      const result2 = getThresholdColor(entity2);
      expect(result2).to.equal('red');
    });

    it('should work with lt operator', () => {
      const entity = createEntity('15', [
        { threshold: 20, icon_color: 'blue', operator: 'lt' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('blue');
    });

    it('should work with lte operator', () => {
      const entity = createEntity('20', [
        { threshold: 20, icon_color: 'blue', operator: 'lte' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('blue');
    });

    it('should work with eq operator', () => {
      const entity = createEntity('50', [
        { threshold: 50, icon_color: 'yellow', operator: 'eq' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('yellow');
    });

    it('should handle decimal values', () => {
      const entity = createEntity('23.5', [
        { threshold: 25.0, icon_color: 'red', operator: 'gt' },
        { threshold: 20.0, icon_color: 'green', operator: 'gte' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('green');
    });

    it('should return undefined when no thresholds match', () => {
      const entity = createEntity('10', [
        { threshold: 50, icon_color: 'green' },
        { threshold: 30, icon_color: 'orange' },
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should process temperature range example correctly', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 25, icon_color: 'red', operator: 'gt' },
        { threshold: 15, icon_color: 'green', operator: 'gte' },
        { threshold: 15, icon_color: 'blue', operator: 'lt' },
      ];

      // Above 25°C = red
      expect(getThresholdColor(createEntity('26', thresholds))).to.equal('red');

      // 15-25°C = green
      expect(getThresholdColor(createEntity('20', thresholds))).to.equal(
        'green',
      );
      expect(getThresholdColor(createEntity('15', thresholds))).to.equal(
        'green',
      );

      // Below 15°C = blue
      expect(getThresholdColor(createEntity('10', thresholds))).to.equal(
        'blue',
      );
    });

    it('should prioritize state-based colors over threshold-based colors', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];

      const entity = createEntity('running', thresholds, states);
      const result = getThresholdColor(entity);
      expect(result).to.equal('green');
    });

    it('should fall back to threshold colors when no state matches', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];

      const entity = createEntity('75', thresholds, states);
      const result = getThresholdColor(entity);
      expect(result).to.equal('red');
    });
  });

  describe('getStateColor', () => {
    const createEntity = (
      state: string,
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no states configured', () => {
      const entity = createEntity('running');
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          states: [{ state: 'running', icon_color: 'green', styles: {} }],
        },
        state: undefined,
      };
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should return color when state matches exactly', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'idle', icon_color: 'blue', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.equal('green');
    });

    it('should return undefined when no state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'idle', icon_color: 'blue', styles: {} },
      ];
      const entity = createEntity('stopped', states);
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should handle case-sensitive state matching', () => {
      const states: StateConfig[] = [
        { state: 'Running', icon_color: 'green', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.be.undefined;
    });

    it('should work with washing machine example states', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'rinsing', icon_color: 'orange', styles: {} },
        { state: 'spinning', icon_color: 'blue', styles: {} },
        { state: 'finished', icon_color: 'purple', styles: {} },
      ];

      expect(getStateColor(createEntity('running', states))).to.equal('green');
      expect(getStateColor(createEntity('rinsing', states))).to.equal('orange');
      expect(getStateColor(createEntity('spinning', states))).to.equal('blue');
      expect(getStateColor(createEntity('finished', states))).to.equal(
        'purple',
      );
      expect(getStateColor(createEntity('idle', states))).to.be.undefined;
    });

    it('should handle numeric string states', () => {
      const states: StateConfig[] = [
        { state: '0', icon_color: 'red', styles: {} },
        { state: '1', icon_color: 'green', styles: {} },
      ];

      expect(getStateColor(createEntity('0', states))).to.equal('red');
      expect(getStateColor(createEntity('1', states))).to.equal('green');
      expect(getStateColor(createEntity('2', states))).to.be.undefined;
    });

    it('should handle special characters in states', () => {
      const states: StateConfig[] = [
        { state: 'on-standby', icon_color: 'yellow', styles: {} },
        { state: 'off/idle', icon_color: 'gray', styles: {} },
      ];

      expect(getStateColor(createEntity('on-standby', states))).to.equal(
        'yellow',
      );
      expect(getStateColor(createEntity('off/idle', states))).to.equal('gray');
    });

    it('should return the first matching state when duplicates exist', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
        { state: 'running', icon_color: 'red', styles: {} },
      ];

      const entity = createEntity('running', states);
      const result = getStateColor(entity);
      expect(result).to.equal('green');
    });
  });

  describe('getThresholdResult', () => {
    const createEntity = (
      state: string,
      thresholds?: ThresholdConfig[],
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        thresholds,
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no thresholds configured', () => {
      const entity = createEntity('25');
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          thresholds: [
            { threshold: 50, icon_color: 'green', icon: 'mdi:thermometer' },
          ],
        },
        state: undefined,
      };
      const result = getThresholdResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return color and icon when threshold matches', () => {
      const entity = createEntity('75', [
        { threshold: 50, icon_color: 'orange', icon: 'mdi:fire' },
      ]);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: 'mdi:fire',
        styles: undefined,
      });
    });

    it('should return only color when threshold matches but no icon defined', () => {
      const entity = createEntity('75', [
        { threshold: 50, icon_color: 'orange' },
      ]);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'orange',
        icon: undefined,
        styles: undefined,
      });
    });

    it('should prioritize state-based results over threshold-based results', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red', icon: 'mdi:fire' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
      ];

      const entity = createEntity('running', thresholds, states);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: 'mdi:play',
        styles: {},
      });
    });

    it('should fall back to threshold results when no state matches', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 50, icon_color: 'red', icon: 'mdi:fire' },
      ];
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];

      const entity = createEntity('75', thresholds, states);
      const result = getThresholdResult(entity);
      expect(result).to.deep.equal({
        color: 'red',
        icon: 'mdi:fire',
        styles: undefined,
      });
    });
  });

  describe('getStateResult', () => {
    const createEntity = (
      state: string,
      states?: StateConfig[],
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        states,
      },
      state: {
        entity_id: 'sensor.test',
        state,
        domain: 'sensor',
        attributes: {},
      },
    });

    it('should return undefined when no states configured', () => {
      const entity = createEntity('running');
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return undefined when state is undefined', () => {
      const entity = {
        config: {
          entity_id: 'sensor.test',
          states: [
            {
              state: 'running',
              icon_color: 'green',
              icon: 'mdi:play',
              styles: {},
            },
          ],
        },
        state: undefined,
      };
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });

    it('should return color and icon when state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
        { state: 'idle', icon_color: 'blue', icon: 'mdi:pause', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: 'mdi:play',
        styles: {},
      });
    });

    it('should return only color when state matches but no icon defined', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', styles: {} },
      ];
      const entity = createEntity('running', states);
      const result = getStateResult(entity);
      expect(result).to.deep.equal({
        color: 'green',
        icon: undefined,
        styles: {},
      });
    });

    it('should return undefined when no state matches', () => {
      const states: StateConfig[] = [
        { state: 'running', icon_color: 'green', icon: 'mdi:play', styles: {} },
        { state: 'idle', icon_color: 'blue', icon: 'mdi:pause', styles: {} },
      ];
      const entity = createEntity('stopped', states);
      const result = getStateResult(entity);
      expect(result).to.be.undefined;
    });
  });
});
