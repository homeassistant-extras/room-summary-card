import {
  applyDiff,
  compressedToEntityState,
  isMeaningfulChange,
} from '@/delegates/entities/subscribe-entities';
import type {
  EntityDiff,
  EntityState as HassEntityState,
} from '@hass/ws/entities';
import type { EntityState } from '@type/room';
import { expect } from 'chai';

describe('subscribe-entities', () => {
  describe('compressedToEntityState', () => {
    it('maps compressed fields to EntityState with domain and timestamps', () => {
      const lc = 1_700_000_000;
      const lu = 1_700_000_060;
      const result = compressedToEntityState('light.kitchen', {
        s: 'on',
        a: { brightness: 128 },
        c: '',
        lc,
        lu,
      });
      expect(result.entity_id).to.equal('light.kitchen');
      expect(result.state).to.equal('on');
      expect(result.attributes).to.deep.equal({ brightness: 128 });
      expect(result.domain).to.equal('light');
      expect(result.last_changed).to.equal(new Date(lc * 1000).toISOString());
      expect(result.last_updated).to.equal(new Date(lu * 1000).toISOString());
    });

    it('uses last_changed for last_updated when lu is missing', () => {
      const lc = 1_700_000_000;
      const result = compressedToEntityState('binary_sensor.door', {
        s: 'off',
        a: {},
        c: '',
        lc,
      } as HassEntityState);
      const iso = new Date(lc * 1000).toISOString();
      expect(result.last_changed).to.equal(iso);
      expect(result.last_updated).to.equal(iso);
    });

    it('defaults attributes to empty object when a is missing', () => {
      const result = compressedToEntityState('sensor.x', {
        s: '42',
        c: '',
        lc: 1,
      } as HassEntityState);
      expect(result.attributes).to.deep.equal({});
    });
  });

  describe('isMeaningfulChange', () => {
    it('is true when state is added', () => {
      expect(isMeaningfulChange({ '+': { s: 'on' } })).to.be.true;
    });

    it('is true when attributes are added', () => {
      expect(isMeaningfulChange({ '+': { a: { x: 1 } } })).to.be.true;
    });

    it('is true when attributes are removed', () => {
      expect(isMeaningfulChange({ '-': { a: ['brightness'] } })).to.be.true;
    });

    it('is false for empty diff', () => {
      expect(isMeaningfulChange({})).to.be.false;
    });

    it('is false when add only has unrelated keys', () => {
      expect(isMeaningfulChange({ '+': { c: '', lc: 1 } } as EntityDiff)).to.be
        .false;
    });

    it('is false when remove has empty attribute list', () => {
      expect(isMeaningfulChange({ '-': { a: [] } })).to.be.false;
    });
  });

  describe('applyDiff', () => {
    const base = (): EntityState => ({
      entity_id: 'light.x',
      state: 'off',
      attributes: { brightness: 100 },
      domain: 'light',
      last_changed: '2024-01-01T00:00:00.000Z',
      last_updated: '2024-01-01T00:00:00.000Z',
    });

    it('updates state from add.s', () => {
      const current = base();
      const next = applyDiff(current, 'light.x', { '+': { s: 'on' } });
      expect(next.state).to.equal('on');
      expect(next.entity_id).to.equal('light.x');
      expect(next.domain).to.equal('light');
    });

    it('merges add.a into attributes', () => {
      const current = base();
      const next = applyDiff(current, 'light.x', {
        '+': { a: { color_mode: 'hs' } },
      });
      expect(next.attributes).to.deep.equal({
        brightness: 100,
        color_mode: 'hs',
      });
    });

    it('removes keys listed in remove.a', () => {
      const current = base();
      const next = applyDiff(current, 'light.x', {
        '-': { a: ['brightness'] },
      });
      expect(next.attributes).to.deep.equal({});
    });

    it('updates last_changed and last_updated when add.lc is set', () => {
      const current = base();
      const ts = 1_704_067_200;
      const next = applyDiff(current, 'light.x', { '+': { lc: ts } });
      const iso = new Date(ts * 1000).toISOString();
      expect(next.last_changed).to.equal(iso);
      expect(next.last_updated).to.equal(iso);
    });

    it('updates only last_updated when add.lu is set without lc', () => {
      const current = base();
      const lu = 1_704_153_600;
      const next = applyDiff(current, 'light.x', { '+': { lu } });
      const iso = new Date(lu * 1000).toISOString();
      expect(next.last_changed).to.equal('2024-01-01T00:00:00.000Z');
      expect(next.last_updated).to.equal(iso);
    });
  });
});
