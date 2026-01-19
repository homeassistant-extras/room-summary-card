import type { BadgeConfig } from '@type/config/entity';
import { expect } from 'chai';
import { BadgeEditorUtils } from '../../../../../src/cards/components/editor/utils/badge-editor-utils';

describe('BadgeEditorUtils', () => {
  describe('getKey', () => {
    it('should generate key using index', () => {
      const badge: BadgeConfig = { position: 'top_right' };
      const key = BadgeEditorUtils.getKey(badge, 0);
      expect(key).to.equal('badge-0');
    });

    it('should generate different keys for different indices', () => {
      const badge: BadgeConfig = { position: 'top_right' };
      const key1 = BadgeEditorUtils.getKey(badge, 0);
      const key2 = BadgeEditorUtils.getKey(badge, 1);
      expect(key1).to.not.equal(key2);
      expect(key1).to.equal('badge-0');
      expect(key2).to.equal('badge-1');
    });

    it('should generate stable keys for same index', () => {
      const badge1: BadgeConfig = { position: 'top_right' };
      const badge2: BadgeConfig = { position: 'bottom_left' };
      const key1 = BadgeEditorUtils.getKey(badge1, 0);
      const key2 = BadgeEditorUtils.getKey(badge2, 0);
      expect(key1).to.equal(key2);
      expect(key1).to.equal('badge-0');
    });
  });

  describe('cleanEmptyStrings', () => {
    it('should return non-object values unchanged', () => {
      expect(BadgeEditorUtils.cleanEmptyStrings(null)).to.be.null;
      expect(BadgeEditorUtils.cleanEmptyStrings(undefined)).to.be.undefined;
      expect(BadgeEditorUtils.cleanEmptyStrings(42)).to.equal(42);
      expect(BadgeEditorUtils.cleanEmptyStrings('test')).to.equal('test');
      expect(BadgeEditorUtils.cleanEmptyStrings(true)).to.be.true;
    });

    it('should remove empty string values', () => {
      const obj = {
        name: 'test',
        empty: '',
        value: 42,
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        name: 'test',
        value: 42,
      });
      expect(cleaned).to.not.have.property('empty');
    });

    it('should recursively clean nested objects', () => {
      const obj = {
        level1: {
          level2: {
            value: 'test',
            empty: '',
          },
          empty: '',
        },
        empty: '',
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        level1: {
          level2: {
            value: 'test',
          },
        },
      });
    });

    it('should remove nested objects that become empty after cleaning', () => {
      const obj = {
        nested: {
          empty: '',
        },
        value: 'test',
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        value: 'test',
      });
      expect(cleaned).to.not.have.property('nested');
    });

    it('should clean arrays recursively', () => {
      const obj = {
        items: [
          { name: 'test', empty: '' },
          { name: 'test2', empty: '' },
        ],
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        items: [{ name: 'test' }, { name: 'test2' }],
      });
    });

    it('should handle arrays with empty string values', () => {
      const obj = {
        items: ['test', '', 'test2'],
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        items: ['test', 'test2'],
      });
    });

    it('should preserve non-empty string values', () => {
      const obj = {
        name: 'test',
        description: 'description',
        value: '',
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        name: 'test',
        description: 'description',
      });
    });

    it('should handle complex nested structures', () => {
      const obj = {
        badge: {
          position: 'top_right',
          mode: '',
          states: [
            { state: 'on', icon: 'mdi:light', empty: '' },
            { state: 'off', icon: '', empty: '' },
          ],
        },
        empty: '',
      };
      const cleaned = BadgeEditorUtils.cleanEmptyStrings(obj);
      expect(cleaned).to.deep.equal({
        badge: {
          position: 'top_right',
          states: [{ state: 'on', icon: 'mdi:light' }, { state: 'off' }],
        },
      });
    });
  });

  describe('getBadgeTitle', () => {
    it('should return title for show_always mode', () => {
      const badge: BadgeConfig = {
        mode: 'show_always',
        position: 'top_right',
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Show Always (top_right)');
    });

    it('should return title for if_match mode', () => {
      const badge: BadgeConfig = {
        mode: 'if_match',
        position: 'bottom_left',
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('If Match (bottom_left)');
    });

    it('should return title for homeassistant mode', () => {
      const badge: BadgeConfig = {
        mode: 'homeassistant',
        position: 'top_left',
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Home Assistant (top_left)');
    });

    it('should return title with states count when states exist', () => {
      const badge: BadgeConfig = {
        position: 'top_right',
        states: [
          { state: 'on', icon_color: '#ff0000' },
          { state: 'off', icon_color: '#000000' },
        ],
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('States (2) - top_right');
    });

    it('should return default badge title when no mode or states', () => {
      const badge: BadgeConfig = {
        position: 'bottom_right',
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Badge bottom_right');
    });

    it('should default to top_right when position is undefined', () => {
      const badge: BadgeConfig = {
        mode: 'show_always',
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Show Always (top_right)');
    });

    it('should prioritize mode over states', () => {
      const badge: BadgeConfig = {
        mode: 'show_always',
        position: 'top_right',
        states: [{ state: 'on', icon_color: '#ff0000' }],
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Show Always (top_right)');
    });

    it('should handle empty states array', () => {
      const badge: BadgeConfig = {
        position: 'top_right',
        states: [],
      };
      const title = BadgeEditorUtils.getBadgeTitle(badge);
      expect(title).to.equal('Badge top_right');
    });
  });
});
