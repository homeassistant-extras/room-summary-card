import { getSliderEntity } from '@delegates/entities/slider-entity';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('slider-entity.ts', () => {
  describe('getSliderEntity', () => {
    it('should return undefined for an undefined config', () => {
      expect(getSliderEntity(undefined)).to.be.undefined;
    });

    it('should return undefined when no entity has a slider block', () => {
      const config = {
        area: 'lr',
        entity: { entity_id: 'light.couch' },
        entities: [
          'light.lamp',
          { entity_id: 'switch.fan', features: ['show_state'] },
        ],
      } as any as Config;

      expect(getSliderEntity(config)).to.be.undefined;
    });

    it('should return the main entity when it has a slider block', () => {
      const config = {
        area: 'lr',
        entity: {
          entity_id: 'input_number.thermostat',
          slider: { style: 'bar' },
        },
        entities: [{ entity_id: 'fan.bed', slider: {} }],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('input_number.thermostat');
    });

    it('should return the first entity in `entities` with a slider block', () => {
      const config = {
        area: 'lr',
        entities: [
          'light.couch',
          { entity_id: 'light.lamp', features: ['show_state'] },
          { entity_id: 'media_player.tv', slider: { style: 'ha' } },
          { entity_id: 'fan.bed', slider: {} },
        ],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('media_player.tv');
    });

    it('should treat an empty slider block (`slider: {}`) as enabled', () => {
      const config = {
        area: 'lr',
        entities: [{ entity_id: 'number.fan_speed', slider: {} }],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('number.fan_speed');
      expect(result?.slider).to.deep.equal({});
    });

    it('should skip plain string entries (no metadata to inspect)', () => {
      const config = {
        area: 'lr',
        entities: [
          'slider',
          { entity_id: 'number.fan_speed', slider: {} },
        ],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('number.fan_speed');
    });

    it('should handle missing entity / entities fields', () => {
      expect(getSliderEntity({ area: 'lr' } as any as Config)).to.be.undefined;
    });

    it('should ignore entities with no slider block', () => {
      const config = {
        area: 'lr',
        entity: { entity_id: 'light.couch' },
        entities: [{ entity_id: 'light.lamp' }],
      } as any as Config;

      expect(getSliderEntity(config)).to.be.undefined;
    });

    it('should prefer `entity` over `entities` when both qualify', () => {
      const config = {
        area: 'lr',
        entity: { entity_id: 'input_number.a', slider: {} },
        entities: [{ entity_id: 'input_number.b', slider: {} }],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('input_number.a');
    });

    it('should expose the per-entity slider config block to callers', () => {
      const config = {
        area: 'lr',
        entities: [
          { entity_id: 'input_number.x', slider: { style: 'ha' } },
        ],
      } as any as Config;

      const result = getSliderEntity(config);
      expect(result?.entity_id).to.equal('input_number.x');
      expect(result?.slider?.style).to.equal('ha');
    });
  });
});
