import { hasEntityFeature } from '@config/feature';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('feature', () => {
  describe('hasEntityFeature', () => {
    it('should return true when entity is null', () => {
      expect(
        hasEntityFeature(null as any as EntityInformation, 'use_entity_icon'),
      ).to.be.true;
    });

    it('should return true when entity is undefined', () => {
      expect(
        hasEntityFeature(
          undefined as any as EntityInformation,
          'use_entity_icon',
        ),
      ).to.be.true;
    });

    it('should return false when entity.config.features is undefined', () => {
      const entity = {
        config: { entity_id: 'light.test' },
      } as EntityInformation;
      expect(hasEntityFeature(entity, 'use_entity_icon')).to.be.false;
    });

    it('should return false when entity.config.features is empty', () => {
      const entity = {
        config: { entity_id: 'light.test', features: [] },
      } as any as EntityInformation;
      expect(hasEntityFeature(entity, 'use_entity_icon')).to.be.false;
    });

    it('should return true when feature is present in entity.config.features', () => {
      const entity = {
        config: { entity_id: 'light.test', features: ['use_entity_icon'] },
      } as EntityInformation;
      expect(hasEntityFeature(entity, 'use_entity_icon')).to.be.true;
    });

    it('should return false when feature is not present in entity.config.features', () => {
      const entity = {
        config: { entity_id: 'light.test', features: [] },
      } as any as EntityInformation;
      expect(hasEntityFeature(entity, 'use_entity_icon')).to.be.false;
    });
  });
});
