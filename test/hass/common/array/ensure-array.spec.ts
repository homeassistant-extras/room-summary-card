import { ensureArray } from '@hass/common/array/ensure-array';
import { expect } from 'chai';

describe('ensure-array.ts', () => {
  describe('ensureArray', () => {
    it('should return undefined when value is undefined', () => {
      // Act & Assert
      expect(ensureArray(undefined)).to.be.undefined;
    });

    it('should return null when value is null', () => {
      // Act & Assert
      expect(ensureArray(null)).to.be.null;
    });

    it('should return the array when value is already an array', () => {
      // Arrange
      const arr = [1, 2, 3];

      // Act & Assert
      expect(ensureArray(arr)).to.deep.equal([1, 2, 3]);
      expect(ensureArray(arr)).to.equal(arr); // Same reference
    });

    it('should wrap a single value in an array', () => {
      // Act & Assert
      expect(ensureArray(42)).to.deep.equal([42]);
      expect(ensureArray('hello')).to.deep.equal(['hello']);
      expect(ensureArray(true)).to.deep.equal([true]);
    });

    it('should handle empty arrays', () => {
      // Arrange
      const emptyArray: number[] = [];

      // Act & Assert
      expect(ensureArray(emptyArray)).to.deep.equal([]);
      expect(ensureArray(emptyArray)).to.equal(emptyArray); // Same reference
    });

    it('should handle readonly arrays', () => {
      // Arrange
      const readonlyArray = [1, 2, 3] as readonly number[];

      // Act & Assert
      expect(ensureArray(readonlyArray)).to.deep.equal([1, 2, 3]);
    });

    it('should handle objects', () => {
      // Arrange
      const obj = { id: 1, name: 'test' };

      // Act & Assert
      expect(ensureArray(obj)).to.deep.equal([obj]);
    });

    it('should handle arrays of different types', () => {
      // Act & Assert
      expect(ensureArray([1, 2, 3])).to.deep.equal([1, 2, 3]);
      expect(ensureArray(['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
      expect(ensureArray([true, false])).to.deep.equal([true, false]);
    });
  });
});
