import { meetsStateCondition, meetsThreshold } from '@util/comparison-utils';
import type { ThresholdConfig } from '@type/config/entity';
import { expect } from 'chai';

describe('comparison-utils.ts', () => {
  describe('meetsStateCondition', () => {
    it('should return true when values are equal with eq operator', () => {
      expect(meetsStateCondition('on', 'on', 'eq')).to.be.true;
    });

    it('should return false when values are not equal with eq operator', () => {
      expect(meetsStateCondition('on', 'off', 'eq')).to.be.false;
    });

    it('should return true when values are not equal with ne operator', () => {
      expect(meetsStateCondition('on', 'off', 'ne')).to.be.true;
    });

    it('should return false when values are equal with ne operator', () => {
      expect(meetsStateCondition('on', 'on', 'ne')).to.be.false;
    });

    it('should default to eq operator for unknown operators', () => {
      expect(meetsStateCondition('test', 'test', 'gt' as any)).to.be.true;
      expect(meetsStateCondition('test', 'other', 'gt' as any)).to.be.false;
    });
  });

  describe('meetsThreshold', () => {
    const createThreshold = (
      threshold: number,
      operator?: ThresholdConfig['operator'],
    ): ThresholdConfig => ({
      threshold,
      operator,
      styles: {},
    });

    it('should return true when value is greater than threshold with gt operator', () => {
      const threshold = createThreshold(10, 'gt');
      expect(meetsThreshold(15, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.false;
      expect(meetsThreshold(5, threshold)).to.be.false;
    });

    it('should return true when value is greater than or equal to threshold with gte operator', () => {
      const threshold = createThreshold(10, 'gte');
      expect(meetsThreshold(15, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.true;
      expect(meetsThreshold(5, threshold)).to.be.false;
    });

    it('should return true when value is less than threshold with lt operator', () => {
      const threshold = createThreshold(10, 'lt');
      expect(meetsThreshold(5, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.false;
      expect(meetsThreshold(15, threshold)).to.be.false;
    });

    it('should return true when value is less than or equal to threshold with lte operator', () => {
      const threshold = createThreshold(10, 'lte');
      expect(meetsThreshold(5, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.true;
      expect(meetsThreshold(15, threshold)).to.be.false;
    });

    it('should return true when value equals threshold with eq operator', () => {
      const threshold = createThreshold(10, 'eq');
      expect(meetsThreshold(10, threshold)).to.be.true;
      expect(meetsThreshold(5, threshold)).to.be.false;
      expect(meetsThreshold(15, threshold)).to.be.false;
    });

    it('should default to gte operator when operator is not specified', () => {
      const threshold = createThreshold(10);
      expect(meetsThreshold(15, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.true;
      expect(meetsThreshold(5, threshold)).to.be.false;
    });

    it('should default to gte operator for unknown operators', () => {
      const threshold = createThreshold(10, 'ne' as any);
      expect(meetsThreshold(15, threshold)).to.be.true;
      expect(meetsThreshold(10, threshold)).to.be.true;
      expect(meetsThreshold(5, threshold)).to.be.false;
    });
  });
});
