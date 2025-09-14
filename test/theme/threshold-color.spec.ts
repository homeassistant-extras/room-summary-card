import { getThresholdColor } from '@theme/threshold-color';
import type { EntityInformation } from '@type/room';
import type { ThresholdConfig } from '@type/config';
import { expect } from 'chai';

describe('threshold-color.ts', () => {
  describe('getThresholdColor', () => {
    const createEntity = (
      state: string,
      thresholds?: ThresholdConfig[]
    ): EntityInformation => ({
      config: {
        entity_id: 'sensor.test',
        thresholds,
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
        { threshold: 50, icon_color: 'green' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should match threshold with default gte operator', () => {
      const entity = createEntity('75', [
        { threshold: 80, icon_color: 'green' },
        { threshold: 50, icon_color: 'orange' },
        { threshold: 20, icon_color: 'red' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('orange');
    });

    it('should match highest applicable threshold first', () => {
      const entity = createEntity('85', [
        { threshold: 80, icon_color: 'green' },
        { threshold: 50, icon_color: 'orange' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('green');
    });

    it('should work with gt operator', () => {
      const entity = createEntity('25', [
        { threshold: 25, icon_color: 'red', operator: 'gt' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined; // 25 is not > 25

      const entity2 = createEntity('26', [
        { threshold: 25, icon_color: 'red', operator: 'gt' }
      ]);
      const result2 = getThresholdColor(entity2);
      expect(result2).to.equal('red');
    });

    it('should work with lt operator', () => {
      const entity = createEntity('15', [
        { threshold: 20, icon_color: 'blue', operator: 'lt' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('blue');
    });

    it('should work with lte operator', () => {
      const entity = createEntity('20', [
        { threshold: 20, icon_color: 'blue', operator: 'lte' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('blue');
    });

    it('should work with eq operator', () => {
      const entity = createEntity('50', [
        { threshold: 50, icon_color: 'yellow', operator: 'eq' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('yellow');
    });

    it('should handle decimal values', () => {
      const entity = createEntity('23.5', [
        { threshold: 25.0, icon_color: 'red', operator: 'gt' },
        { threshold: 20.0, icon_color: 'green', operator: 'gte' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.equal('green');
    });

    it('should return undefined when no thresholds match', () => {
      const entity = createEntity('10', [
        { threshold: 50, icon_color: 'green' },
        { threshold: 30, icon_color: 'orange' }
      ]);
      const result = getThresholdColor(entity);
      expect(result).to.be.undefined;
    });

    it('should process temperature range example correctly', () => {
      const thresholds: ThresholdConfig[] = [
        { threshold: 25, icon_color: 'red', operator: 'gt' },
        { threshold: 15, icon_color: 'green', operator: 'gte' },
        { threshold: 15, icon_color: 'blue', operator: 'lt' }
      ];

      // Above 25°C = red
      expect(getThresholdColor(createEntity('26', thresholds))).to.equal('red');

      // 15-25°C = green
      expect(getThresholdColor(createEntity('20', thresholds))).to.equal('green');
      expect(getThresholdColor(createEntity('15', thresholds))).to.equal('green');

      // Below 15°C = blue
      expect(getThresholdColor(createEntity('10', thresholds))).to.equal('blue');
    });
  });
});