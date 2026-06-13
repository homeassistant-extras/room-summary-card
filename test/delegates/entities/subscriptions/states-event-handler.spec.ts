import { StatesEventHandler } from '@delegates/entities/subscriptions';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { StatesUpdates } from '@homeassistant-extras/hass/ws/entities';
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

  it('processes ev.c (change) for subscribed entities with meaningful diffs', () => {
    const listeners = new Map<
      string,
      Set<(s: EntityState | undefined) => void>
    >();
    const state = new Map<string, EntityState>();
    const calls: Array<EntityState | undefined> = [];

    const set = new Set<(s: EntityState | undefined) => void>();
    set.add((s) => calls.push(s));
    listeners.set('light.a', set);

    const initial: EntityState = {
      entity_id: 'light.a',
      state: 'off',
      attributes: { brightness: 100 },
      domain: 'light',
      last_changed: '2024-01-01T00:00:00.000Z',
      last_updated: '2024-01-01T00:00:00.000Z',
    };
    state.set('light.a', initial);

    const hass = { states: {} } as unknown as HomeAssistant;
    const handler = new StatesEventHandler(listeners, state, hass);

    handler.handle({
      c: {
        'light.a': { '+': { s: 'on', a: { brightness: 255 } } },
      },
    });

    expect(state.get('light.a')).to.deep.include({ state: 'on' });
    expect(state.get('light.a')?.attributes).to.deep.include({
      brightness: 255,
    });
    expect(calls).to.have.length(1);
    expect(calls[0]).to.deep.include({ state: 'on' });
  });

  it('falls back to hass.states when applying a change with no cached state', () => {
    const listeners = new Map<
      string,
      Set<(s: EntityState | undefined) => void>
    >();
    const state = new Map<string, EntityState>();
    const calls: Array<EntityState | undefined> = [];

    const set = new Set<(s: EntityState | undefined) => void>();
    set.add((s) => calls.push(s));
    listeners.set('light.a', set);

    const hass = {
      states: {
        'light.a': {
          entity_id: 'light.a',
          state: 'off',
          attributes: { brightness: 50 },
          last_changed: '2024-01-01T00:00:00.000Z',
          last_updated: '2024-01-01T00:00:00.000Z',
        },
      },
    } as unknown as HomeAssistant;
    const handler = new StatesEventHandler(listeners, state, hass);

    handler.handle({
      c: {
        'light.a': { '+': { s: 'on' } },
      },
    });

    expect(state.get('light.a')).to.deep.include({ state: 'on' });
    expect(calls).to.have.length(1);
    expect(calls[0]).to.deep.include({ state: 'on' });
  });

  it('ignores change events for unsubscribed entities and non-meaningful diffs', () => {
    const listeners = new Map<
      string,
      Set<(s: EntityState | undefined) => void>
    >();
    const state = new Map<string, EntityState>();
    const calls: Array<EntityState | undefined> = [];

    const set = new Set<(s: EntityState | undefined) => void>();
    set.add((s) => calls.push(s));
    listeners.set('light.a', set);

    const initial: EntityState = {
      entity_id: 'light.a',
      state: 'off',
      attributes: {},
      domain: 'light',
      last_changed: '2024-01-01T00:00:00.000Z',
      last_updated: '2024-01-01T00:00:00.000Z',
    };
    state.set('light.a', initial);

    const hass = { states: {} } as unknown as HomeAssistant;
    const handler = new StatesEventHandler(listeners, state, hass);

    handler.handle({
      c: {
        'light.b': { '+': { s: 'on' } },
        'light.a': { '+': { c: 'context-id' } },
      },
    });

    expect(state.get('light.a')?.state).to.equal('off');
    expect(calls).to.be.empty;
  });
});
