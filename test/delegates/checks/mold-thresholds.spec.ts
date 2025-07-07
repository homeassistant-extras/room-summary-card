import { shouldShowMoldIndicator } from '@delegates/checks/moldy';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { expect } from 'chai';

describe('mold-thresholds.ts', () => {
  describe('shouldShowMoldIndicator', () => {
    const createMoldSensor = (state: string): EntityState => ({
      entity_id: 'sensor.mold',
      state,
      attributes: {},
      domain: 'sensor',
    });

    const createConfig = (moldThreshold?: number): Config => ({
      area: 'test',
      ...(moldThreshold !== undefined && {
        thresholds: { mold: moldThreshold },
      }),
    });

    it('should show mold indicator when no threshold is set', () => {
      const moldSensor = createMoldSensor('25');
      const config = createConfig();

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should show mold indicator when value is at threshold', () => {
      const moldSensor = createMoldSensor('50');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should show mold indicator when value is above threshold', () => {
      const moldSensor = createMoldSensor('75');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should hide mold indicator when value is below threshold', () => {
      const moldSensor = createMoldSensor('25');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should hide mold indicator when value is not a number', () => {
      const moldSensor = createMoldSensor('invalid');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle decimal values correctly', () => {
      const moldSensor = createMoldSensor('49.9');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle decimal values at threshold', () => {
      const moldSensor = createMoldSensor('50.0');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should handle decimal values above threshold', () => {
      const moldSensor = createMoldSensor('50.1');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should handle zero threshold', () => {
      const moldSensor = createMoldSensor('0');
      const config = createConfig(0);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should handle zero value with positive threshold', () => {
      const moldSensor = createMoldSensor('0');
      const config = createConfig(10);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle negative values', () => {
      const moldSensor = createMoldSensor('-5');
      const config = createConfig(0);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle empty string state', () => {
      const moldSensor = createMoldSensor('');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle null state', () => {
      const moldSensor = createMoldSensor('null');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle undefined state', () => {
      const moldSensor = createMoldSensor('undefined');
      const config = createConfig(50);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle very large numbers', () => {
      const moldSensor = createMoldSensor('999999');
      const config = createConfig(100);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });

    it('should handle very small numbers', () => {
      const moldSensor = createMoldSensor('0.001');
      const config = createConfig(1);

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.false;
    });

    it('should handle threshold with other threshold properties', () => {
      const moldSensor = createMoldSensor('75');
      const config: Config = {
        area: 'test',
        thresholds: {
          temperature: 80,
          humidity: 60,
          mold: 50,
        },
      };

      const result = shouldShowMoldIndicator(moldSensor, config);

      expect(result).to.be.true;
    });
  });
});
