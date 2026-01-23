import type { BadgeConfig, StateConfig } from '@type/config/entity';
import { expect } from 'chai';
import { stub } from 'sinon';
import {
  badgeStatesValueChanged,
  badgeValueChanged,
} from '../../../../../src/cards/components/editor/utils/badge-editor-handlers';

describe('badge-editor-handlers', () => {
  describe('badgeValueChanged', () => {
    it('should update badge at specified index', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left', mode: 'show_always' },
        { position: 'top_right', mode: 'if_match' },
      ];
      const updatedBadge: BadgeConfig = {
        position: 'bottom_left',
        mode: 'homeassistant',
      };
      const newBadges = badgeValueChanged(badges, 0, updatedBadge);
      expect(newBadges[0]).to.deep.equal(updatedBadge);
      expect(newBadges[1]).to.deep.equal(badges[1]);
    });

    it('should update badge at different index', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left' },
        { position: 'top_right' },
      ];
      const updatedBadge: BadgeConfig = {
        position: 'bottom_right',
        mode: 'show_always',
      };
      const newBadges = badgeValueChanged(badges, 1, updatedBadge);
      expect(newBadges[0]).to.deep.equal(badges[0]);
      expect(newBadges[1]).to.deep.equal(updatedBadge);
    });

    it('should handle undefined badges array', () => {
      const updatedBadge: BadgeConfig = {
        position: 'top_right',
        mode: 'show_always',
      };
      const newBadges = badgeValueChanged(undefined, 0, updatedBadge);
      expect(newBadges).to.be.an('array');
      expect(newBadges[0]).to.deep.equal(updatedBadge);
    });

    it('should clean empty strings from updated badge', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const updatedBadge = {
        position: 'top_right',
        mode: '',
        entity_id: 'light.test',
        empty: '',
      };
      const newBadges = badgeValueChanged(badges, 0, updatedBadge);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
        entity_id: 'light.test',
      });
      expect(newBadges[0]).to.not.have.property('mode');
      expect(newBadges[0]).to.not.have.property('empty');
    });

    it('should not update when value is not an object', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const newBadges = badgeValueChanged(badges, 0, null as any);
      expect(newBadges).to.deep.equal(badges);
    });

    it('should not mutate original array', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const updatedBadge: BadgeConfig = { position: 'top_right' };
      badgeValueChanged(badges, 0, updatedBadge);
      expect(badges[0]?.position).to.equal('top_left');
    });

    it('should handle nested objects with empty strings', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const updatedBadge = {
        position: 'top_right',
        nested: {
          value: 'test',
          empty: '',
        },
        empty: '',
      };
      const newBadges = badgeValueChanged(badges, 0, updatedBadge);
      expect(newBadges[0]).to.deep.equal({
        position: 'top_right',
        nested: {
          value: 'test',
        },
      });
    });
  });

  describe('badgeStatesValueChanged', () => {
    it('should update badge states at specified index', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_left',
          states: [{ state: 'on', icon_color: '#ff0000' }],
        },
        { position: 'top_right' },
      ];
      const statesValue: StateConfig[] = [
        { state: 'off', icon_color: '#000000' },
        { state: 'standby', icon_color: '#888888' },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, statesValue);
      expect(newBadges[0]?.states).to.deep.equal(statesValue);
      expect(newBadges[1]).to.deep.equal(badges[1]);
    });

    it('should update badge states at different index', () => {
      const badges: BadgeConfig[] = [
        { position: 'top_left' },
        { position: 'top_right' },
      ];
      const statesValue: StateConfig[] = [
        { state: 'on', icon_color: '#ff0000' },
      ];
      const newBadges = badgeStatesValueChanged(badges, 1, statesValue);
      expect(newBadges[0]).to.deep.equal(badges[0]);
      expect(newBadges[1]?.states).to.deep.equal(statesValue);
    });

    it('should handle undefined badges array', () => {
      const statesValue: StateConfig[] = [
        { state: 'on', icon_color: '#ff0000' },
      ];
      const newBadges = badgeStatesValueChanged(undefined, 0, statesValue);
      expect(newBadges).to.be.an('array');
      expect(newBadges[0]?.states).to.deep.equal(statesValue);
    });

    it('should clean empty strings from states', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const statesValue = [
        { state: 'on', icon_color: '#ff0000', empty: '' },
        { state: 'off', icon: '', empty: '' },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, statesValue);
      expect(newBadges[0]?.states).to.deep.equal([
        { state: 'on', icon_color: '#ff0000' },
        { state: 'off' },
      ]);
    });

    it('should remove states property when states array is empty', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_left',
          states: [{ state: 'on', icon_color: '#ff0000' }],
        },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, []);
      expect(newBadges[0]).to.not.have.property('states');
    });

    it('should warn and return original badges when statesValue is not an array', () => {
      const consoleWarnStub = stub(console, 'warn');
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const newBadges = badgeStatesValueChanged(
        badges,
        0,
        'not an array' as any,
      );
      expect(consoleWarnStub.called).to.be.true;
      expect(newBadges).to.deep.equal(badges);
      consoleWarnStub.restore();
    });

    it('should preserve other badge properties when updating states', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_left',
          mode: 'if_match',
          entity_id: 'light.test',
          states: [{ state: 'on', icon_color: '#ff0000' }],
        },
      ];
      const statesValue: StateConfig[] = [
        { state: 'off', icon_color: '#000000' },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, statesValue);
      expect(newBadges[0]?.position).to.equal('top_left');
      expect(newBadges[0]?.mode).to.equal('if_match');
      expect(newBadges[0]?.entity_id).to.equal('light.test');
      expect(newBadges[0]?.states).to.deep.equal(statesValue);
    });

    it('should handle nested objects in states', () => {
      const badges: BadgeConfig[] = [{ position: 'top_left' }];
      const statesValue = [
        {
          state: 'on',
          icon_color: '#ff0000',
          nested: {
            value: 'test',
            empty: '',
          },
          empty: '',
        },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, statesValue);
      expect(newBadges[0]?.states).to.deep.equal([
        {
          state: 'on',
          icon_color: '#ff0000',
          nested: {
            value: 'test',
          },
        },
      ]);
    });

    it('should not mutate original array', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_left',
          states: [{ state: 'on', icon_color: '#ff0000' }],
        },
      ];
      const statesValue: StateConfig[] = [
        { state: 'off', icon_color: '#000000' },
      ];
      badgeStatesValueChanged(badges, 0, statesValue);
      expect(badges[0]?.states?.[0]?.state).to.equal('on');
    });

    it('should handle removing states from badge that had states', () => {
      const badges: BadgeConfig[] = [
        {
          position: 'top_left',
          states: [
            { state: 'on', icon_color: '#ff0000' },
            { state: 'off', icon_color: '#000000' },
          ],
        },
      ];
      const newBadges = badgeStatesValueChanged(badges, 0, []);
      expect(newBadges[0]).to.not.have.property('states');
      expect(newBadges[0]?.position).to.equal('top_left');
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: update badge, update states', () => {
      let badges: BadgeConfig[] = [
        { position: 'top_left', mode: 'show_always' },
      ];

      // Update badge
      const updatedBadge: BadgeConfig = {
        position: 'top_right',
        mode: 'if_match',
      };
      badges = badgeValueChanged(badges, 0, updatedBadge);
      expect(badges[0]?.position).to.equal('top_right');
      expect(badges[0]?.mode).to.equal('if_match');

      // Update states
      const statesValue: StateConfig[] = [
        { state: 'on', icon_color: '#ff0000' },
      ];
      badges = badgeStatesValueChanged(badges, 0, statesValue);
      expect(badges[0]?.states).to.deep.equal(statesValue);
    });
  });
});
