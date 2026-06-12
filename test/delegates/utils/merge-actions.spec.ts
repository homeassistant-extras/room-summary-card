import { mergeActions } from '@delegates/utils/merge-actions';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';

describe('merge-actions.ts', () => {
  const entity: EntityInformation = {
    config: {
      entity_id: 'light.living_room',
      tap_action: { action: 'toggle' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'none' },
    },
    state: e('light', 'living_room', 'on'),
  };

  it('merges config.actions over the entity action config', () => {
    const config: Config = {
      area: 'living_room',
      actions: {
        tap_action: { action: 'navigate', navigation_path: '#test-hash' },
      },
    };

    const merged = mergeActions(entity, config);

    // overridden by config.actions
    expect(merged.config.tap_action).to.deep.equal({
      action: 'navigate',
      navigation_path: '#test-hash',
    });
    // entity config preserved where actions doesn't override
    expect(merged.config.entity_id).to.equal('light.living_room');
    expect(merged.config.hold_action).to.deep.equal({ action: 'more-info' });
    expect(merged.config.double_tap_action).to.deep.equal({ action: 'none' });
    expect(merged.state).to.equal(entity.state);
    // original entity untouched
    expect(entity.config.tap_action).to.deep.equal({ action: 'toggle' });
  });

  it('returns an equivalent entity when no actions are configured', () => {
    const merged = mergeActions(entity, { area: 'living_room' });

    expect(merged).to.deep.equal(entity);
  });
});
