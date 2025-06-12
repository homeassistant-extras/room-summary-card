import { getRgbColor } from '@theme/get-rgb';
import type { EntityState } from '@type/room';
import { expect } from 'chai';

export default () => {
  describe('rgb-color.ts', () => {
    describe('getRgbColor', () => {
      // Helper to create entity state objects for testing
      const createStateObj = (
        entity_id: string = 'light.test',
        state: string = 'on',
        attributes: Record<string, any> = {},
      ): EntityState => ({
        entity_id,
        state,
        attributes,
        domain: 'light',
      });

      it('should return rgb string when rgb_color attribute is valid', () => {
        const state = createStateObj('light.test', 'on', {
          rgb_color: [255, 100, 50],
        });

        const result = getRgbColor(state, '', '', true);
        expect(result).to.equal('rgb(255, 100, 50)');
      });

      it('should return undefined when rgb_color is missing', () => {
        const state = createStateObj('light.test', 'on', {});

        const result = getRgbColor(state, '', '', true);
        expect(result).to.be.undefined;
      });

      it('should return undefined when rgb_color is not an array', () => {
        const state = createStateObj('light.test', 'on', {
          rgb_color: 'not an array',
        });

        const result = getRgbColor(state, '', '', true);
        expect(result).to.be.undefined;
      });

      it('should return undefined when rgb_color array length is not 3', () => {
        const stateTooFew = createStateObj('light.test', 'on', {
          rgb_color: [255, 100],
        });
        const stateTooMany = createStateObj('light.test', 'on', {
          rgb_color: [255, 100, 50, 255],
        });

        const resultTooFew = getRgbColor(stateTooFew, '', '', true);
        const resultTooMany = getRgbColor(stateTooMany, '', '', true);

        expect(resultTooFew).to.be.undefined;
        expect(resultTooMany).to.be.undefined;
      });

      it('should return undefined when active and onColor are set', () => {
        const state = createStateObj('light.test', 'on', {
          rgb_color: [255, 100, 50],
        });

        const result = getRgbColor(state, 'red', '', true);
        expect(result).to.be.undefined;
      });

      it('should return undefined when inactive and offColor are set', () => {
        const state = createStateObj('light.test', 'off', {
          rgb_color: [255, 100, 50],
        });

        const result = getRgbColor(state, '', 'gray', false);
        expect(result).to.be.undefined;
      });

      it('should return rgb string when active but onColor is not set', () => {
        const state = createStateObj('light.test', 'on', {
          rgb_color: [255, 100, 50],
        });

        const result = getRgbColor(state, '', 'gray', true);
        expect(result).to.equal('rgb(255, 100, 50)');
      });

      it('should return rgb string when inactive but offColor is not set', () => {
        const state = createStateObj('light.test', 'off', {
          rgb_color: [255, 100, 50],
        });

        const result = getRgbColor(state, 'red', '', false);
        expect(result).to.equal('rgb(255, 100, 50)');
      });

      it('should handle edge cases with zeros in rgb values', () => {
        const state = createStateObj('light.test', 'on', {
          rgb_color: [0, 0, 0],
        });

        const result = getRgbColor(state, '', '', true);
        expect(result).to.equal('rgb(0, 0, 0)');
      });

      it('should process both active and inactive states correctly', () => {
        const activeState = createStateObj('light.test', 'on', {
          rgb_color: [255, 100, 50],
        });
        const inactiveState = createStateObj('light.test', 'off', {
          rgb_color: [30, 30, 30],
        });

        // Both should work when colors aren't provided
        expect(getRgbColor(activeState, '', '', true)).to.equal(
          'rgb(255, 100, 50)',
        );
        expect(getRgbColor(inactiveState, '', '', false)).to.equal(
          'rgb(30, 30, 30)',
        );
      });
    });
  });
};
