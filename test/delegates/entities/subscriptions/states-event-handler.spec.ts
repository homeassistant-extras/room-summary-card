import { StatesEventHandler } from '@delegates/entities/subscriptions';
import type { HomeAssistant } from '@hass/types';
import type { StatesUpdates } from '@hass/ws/entities';
import type { EntityState } from '@type/room';
import { expect } from 'chai';

describe('StatesEventHandler', () => {
  it('processes ev.a (add) and ev.r (remove) for subscribed entities', () => {
    const listeners = new Map<
      string,
      Set<(s: EntityState | undefined) => void>
    >();
    const state = new Map<string, EntityState>();
    const calls: Array<EntityState | undefined> = [];

    const set = new Set<(s: EntityState | undefined) => void>();
    set.add((s) => calls.push(s));
    listeners.set('light.a', set);

    const hass = { states: {} } as unknown as HomeAssistant;
    const handler = new StatesEventHandler(listeners, state, hass);

    // Add: ev.a
    const evAdd: StatesUpdates = {
      a: {
        'light.a': {
          s: 'on',
          a: { brightness: 255 },
          c: '',
          lc: 0,
          lu: 0,
        },
      },
      c: {},
    };
    handler.handle(evAdd);
    expect(state.get('light.a')).to.deep.include({
      entity_id: 'light.a',
      state: 'on',
      attributes: { brightness: 255 },
    });
    expect(calls).to.have.length(1);
    expect(calls[0]).to.deep.include({ state: 'on' });

    // Remove: ev.r
    calls.length = 0;
    const evRemove: StatesUpdates = { r: ['light.a'], c: {} };
    handler.handle(evRemove);
    expect(state.has('light.a')).to.be.false;
    expect(calls).to.have.length(1);
    expect(calls[0]).to.be.undefined;
  });
});
