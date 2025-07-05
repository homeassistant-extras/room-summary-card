import { arrayLiteralIncludes } from '@hass/common/array/literal-includes';
import { expect } from 'chai';

describe('literal-includes.ts', () => {
  describe('arrayLiteralIncludes', () => {
    it('should return true when the element exists in the array', () => {
      // Arrange
      const fruits = ['apple', 'banana', 'orange'] as const;
      const includesFruit = arrayLiteralIncludes(fruits);

      // Act & Assert
      expect(includesFruit('banana')).to.be.true;
    });

    it('should return false when the element does not exist in the array', () => {
      // Arrange
      const numbers = [1, 2, 3, 4, 5] as const;
      const includesNumber = arrayLiteralIncludes(numbers);

      // Act & Assert
      expect(includesNumber(6)).to.be.false;
    });

    it('should work with mixed type arrays', () => {
      // Arrange
      const mixed = [1, 'two', true, null, undefined] as const;
      const includesMixed = arrayLiteralIncludes(mixed);

      // Act & Assert
      expect(includesMixed('two')).to.be.true;
      expect(includesMixed(true)).to.be.true;
      expect(includesMixed(null)).to.be.true;
      expect(includesMixed(undefined)).to.be.true;
      expect(includesMixed(2)).to.be.false;
      expect(includesMixed('one')).to.be.false;
    });

    it('should respect the fromIndex parameter', () => {
      // Arrange
      const letters = ['a', 'b', 'c', 'd', 'a'] as const;
      const includesLetter = arrayLiteralIncludes(letters);

      // Act & Assert
      expect(includesLetter('a')).to.be.true;
      expect(includesLetter('a', 0)).to.be.true;
      expect(includesLetter('a', 1)).to.be.true; // Should find the second 'a'
      expect(includesLetter('b', 2)).to.be.false; // 'b' is at index 1, so starting from 2 won't find it
    });

    it('should work with empty arrays', () => {
      // Arrange
      const emptyArray = [] as const;
      const includesInEmpty = arrayLiteralIncludes(emptyArray);

      // Act & Assert
      expect(includesInEmpty('anything')).to.be.false;
    });

    it('should work with object arrays', () => {
      // Arrange
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };
      const objects = [obj1, obj2] as const;
      const includesObject = arrayLiteralIncludes(objects);

      // Act & Assert
      expect(includesObject(obj1)).to.be.true;
      expect(includesObject(obj2)).to.be.true;
      expect(includesObject(obj3)).to.be.false;
      expect(includesObject({ id: 1 })).to.be.false; // Different object reference
    });

    it('should handle negative fromIndex', () => {
      // Arrange
      const values = [10, 20, 30, 40, 50] as const;
      const includesValue = arrayLiteralIncludes(values);

      // Act & Assert
      expect(includesValue(30, -3)).to.be.true; // -3 means start 3 from the end, which is at index 2 (30)
      expect(includesValue(20, -3)).to.be.false; // -3 starts at index 2, so it won't find 20 (at index 1)
      expect(includesValue(50, -1)).to.be.true; // -1 starts at the last element
    });

    it('should support type narrowing in conditional blocks', () => {
      // This test verifies the TypeScript type guard functionality

      // Arrange
      const possibleValues = ['low', 'medium', 'high'] as const;
      const includesValue = arrayLiteralIncludes(possibleValues);
      const someValue: unknown = 'medium';

      // Act & Type narrowing check
      if (includesValue(someValue)) {
        // In this block, someValue should be narrowed to 'low' | 'medium' | 'high'
        // This is a runtime test but also validates compile-time typing
        const validValue: (typeof possibleValues)[number] = someValue;

        // Assert
        expect(validValue).to.equal('medium');
      } else {
        // This should not execute for this test
        expect.fail('Type guard should have passed');
      }
    });
  });
});
