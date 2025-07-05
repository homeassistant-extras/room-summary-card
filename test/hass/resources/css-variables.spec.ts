// css-variables.test.js
import { computeCssVariable } from '@hass/resources/css-variables';
import { expect } from 'chai';

describe('css-variables.ts', () => {
  describe('computeCssVariable', () => {
    it('should return a CSS variable string for a single property', () => {
      const result = computeCssVariable('--primary-color');
      expect(result).to.equal('var(--primary-color)');
    });

    it('should return a CSS variable with fallbacks for an array of properties', () => {
      const result = computeCssVariable([
        '--primary-color',
        '--secondary-color',
        '--default-color',
      ]);
      expect(result).to.equal(
        'var(--primary-color, var(--secondary-color, var(--default-color)))',
      );
    });

    it('should handle an empty array by returning undefined', () => {
      const result = computeCssVariable([]);
      expect(result).to.equal(undefined);
    });

    it('should properly format CSS variables with hyphens and numbers', () => {
      const result = computeCssVariable('--color-rgb-123');
      expect(result).to.equal('var(--color-rgb-123)');
    });

    it('should handle a single element array the same as a string', () => {
      const stringResult = computeCssVariable('--single-var');
      const arrayResult = computeCssVariable(['--single-var']);
      expect(arrayResult).to.equal('var(--single-var)');
      expect(arrayResult).to.equal(stringResult);
    });

    it('should apply fallbacks in the correct order', () => {
      // The function should apply the array in reverse order
      // with the first element as the primary and the last as the final fallback
      const result = computeCssVariable(['--first', '--second', '--third']);
      expect(result).to.equal('var(--first, var(--second, var(--third)))');
    });
  });
});
