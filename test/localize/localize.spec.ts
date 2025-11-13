import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import { expect } from 'chai';

describe('localize.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      language: 'en',
      entities: {},
      devices: {},
      areas: {},
      states: {},
    } as any as HomeAssistant;
  });

  describe('localize', () => {
    it('should return translation for valid key', () => {
      const result = localize(mockHass, 'editor.area.area');
      expect(result).to.be.a('string');
      expect(result).to.equal('Area'); // Should be translated
    });

    it('should return key when translation not found', () => {
      const result = localize(mockHass, 'nonexistent.key' as any);
      expect(result).to.equal('nonexistent.key');
    });

    it('should replace search string with replace string', () => {
      // Test line 38: translated.replace(search, replace)
      const result = localize(mockHass, 'editor.area.area', 'Area', 'Room');
      // The translation is "Area", so it should be replaced with "Room"
      expect(result).to.equal('Room');
      expect(result).to.not.include('Area');
    });

    it('should not replace when search is empty', () => {
      // Test line 37: search !== '' check
      const original = localize(mockHass, 'editor.area.area');
      const result = localize(mockHass, 'editor.area.area', '', 'Room');
      expect(result).to.equal(original);
      expect(result).to.equal('Area');
    });

    it('should not replace when replace is empty', () => {
      // Test line 37: replace !== '' check
      const original = localize(mockHass, 'editor.area.area');
      const result = localize(mockHass, 'editor.area.area', 'Area', '');
      expect(result).to.equal(original);
      expect(result).to.equal('Area');
    });

    it('should handle getNestedTranslation when intermediate value is not an object', () => {
      // Test line 52-53: when navigating through path and result is not an object
      // 'editor.area.area' resolves to the string "Area", so accessing
      // 'editor.area.area.nonexistent' should hit the check at line 52-53
      // because "Area" is a string, not an object
      const result = localize(mockHass, 'editor.area.area.nonexistent' as any);
      // Should return the key since the path doesn't resolve to a string
      expect(result).to.equal('editor.area.area.nonexistent');
    });

    it('should handle getNestedTranslation when result becomes null', () => {
      // Test line 52: result === null check
      // Use a path that doesn't exist to trigger null check
      const result = localize(mockHass, 'editor.nonexistent.path' as any);
      expect(result).to.equal('editor.nonexistent.path');
    });

    it('should handle getNestedTranslation when result becomes undefined', () => {
      // Test line 52: result === undefined check
      const result = localize(mockHass, 'editor.area.nonexistent.key' as any);
      expect(result).to.equal('editor.area.nonexistent.key');
    });
  });
});
