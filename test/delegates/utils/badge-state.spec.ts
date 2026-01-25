import { getMatchingBadgeState } from '@delegates/utils/badge-state';
import { createStateEntity } from '@test/test-helpers';
import type { BadgeConfig, StateConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';

describe('badge-state.ts', () => {
  const createEntity = (
    state: string,
    attributes: Record<string, any> = {},
  ): EntityInformation => ({
    config: {
      entity_id: 'light.test',
    },
    state: createStateEntity('light', 'test', state, attributes),
  });

  const createBadge = (states?: StateConfig[]): BadgeConfig => ({
    states,
  });

  describe('getMatchingBadgeState', () => {
    it('should return undefined when no states configured', () => {
      const entity = createEntity('on');
      const badge = createBadge();
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.be.undefined;
    });

    it('should return undefined when entity state is undefined', () => {
      const entity: EntityInformation = {
        config: { entity_id: 'light.test' },
        state: undefined,
      };
      const badge = createBadge([
        { state: 'on', icon_color: 'yellow', icon: 'mdi:light-on' },
      ]);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.be.undefined;
    });

    it('should return matching state config when state matches', () => {
      const states: StateConfig[] = [
        { state: 'on', icon_color: 'yellow', icon: 'mdi:light-on' },
        { state: 'off', icon_color: 'grey', icon: 'mdi:light-off' },
      ];
      const entity = createEntity('on');
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.deep.equal(states[0]);
    });

    it('should return first matching state when multiple states match', () => {
      const states: StateConfig[] = [
        { state: 'on', icon_color: 'yellow', icon: 'mdi:light-on' },
        { state: 'on', icon_color: 'red', icon: 'mdi:alert' },
      ];
      const entity = createEntity('on');
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.deep.equal(states[0]);
    });

    it('should return undefined when no state matches', () => {
      const states: StateConfig[] = [
        { state: 'on', icon_color: 'yellow', icon: 'mdi:light-on' },
        { state: 'off', icon_color: 'grey', icon: 'mdi:light-off' },
      ];
      const entity = createEntity('unavailable');
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.be.undefined;
    });

    it('should match by attribute when attribute is specified', () => {
      const states: StateConfig[] = [
        {
          state: 'heating',
          icon_color: 'red',
          icon: 'mdi:radiator',
          attribute: 'hvac_action',
        },
        {
          state: 'cooling',
          icon_color: 'blue',
          icon: 'mdi:snowflake',
          attribute: 'hvac_action',
        },
      ];
      const entity = createEntity('heat', { hvac_action: 'heating' });
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.deep.equal(states[0]);
    });

    it('should match entity state when attribute is not specified', () => {
      const states: StateConfig[] = [
        { state: 'heat', icon_color: 'red', icon: 'mdi:radiator' },
        { state: 'cool', icon_color: 'blue', icon: 'mdi:snowflake' },
      ];
      const entity = createEntity('heat', { hvac_action: 'heating' });
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.deep.equal(states[0]);
    });

    it('should handle case-sensitive matching', () => {
      const states: StateConfig[] = [
        { state: 'On', icon_color: 'yellow', icon: 'mdi:light-on' },
      ];
      const entity = createEntity('on');
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.be.undefined;
    });

    it('should handle empty attribute values', () => {
      const states: StateConfig[] = [
        {
          state: '',
          icon_color: 'grey',
          icon: 'mdi:blank',
          attribute: 'custom_attr',
        },
      ];
      const entity = createEntity('on', { custom_attr: '' });
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.deep.equal(states[0]);
    });

    it('should handle missing attribute values', () => {
      const states: StateConfig[] = [
        {
          state: 'heating',
          icon_color: 'red',
          icon: 'mdi:radiator',
          attribute: 'hvac_action',
        },
      ];
      const entity = createEntity('heat');
      const badge = createBadge(states);
      const result = getMatchingBadgeState(entity, badge);
      expect(result).to.be.undefined;
    });

    describe('operator support', () => {
      it('should work with ne operator and attribute-based matching', () => {
        const states: StateConfig[] = [
          {
            state: 'ok',
            attribute: 'status',
            icon_color: 'red',
            icon: 'mdi:alert',
            operator: 'ne',
          },
        ];
        const entity = createEntity('unknown', { status: 'error' });
        const badge = createBadge(states);
        const result = getMatchingBadgeState(entity, badge);
        expect(result).to.deep.equal(states[0]);
      });

      it('should evaluate states in order - eq before ne', () => {
        const states: StateConfig[] = [
          { state: 'ok', icon_color: 'green', icon: 'mdi:check', operator: 'eq' },
          { state: 'ok', icon_color: 'red', icon: 'mdi:alert', operator: 'ne' },
        ];
        const entity = createEntity('ok');
        const badge = createBadge(states);
        const result = getMatchingBadgeState(entity, badge);
        // Should match the first eq condition, not the ne condition
        expect(result).to.deep.equal(states[0]);
      });

      it('should evaluate states in order - ne matches when eq does not', () => {
        const states: StateConfig[] = [
          { state: 'ok', icon_color: 'green', icon: 'mdi:check', operator: 'eq' },
          { state: 'ok', icon_color: 'red', icon: 'mdi:alert', operator: 'ne' },
        ];
        const entity = createEntity('error');
        const badge = createBadge(states);
        const result = getMatchingBadgeState(entity, badge);
        // Should match the ne condition since eq doesn't match
        expect(result).to.deep.equal(states[1]);
      });
    });
  });
});
