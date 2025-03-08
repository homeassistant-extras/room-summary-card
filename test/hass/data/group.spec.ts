import { computeGroupDomain, type GroupEntity } from '@hass/data/group';
import { expect } from 'chai';

export default () => {
  describe('group.ts', () => {
    describe('computeGroupDomain', () => {
      it('should return undefined when entity_id array is empty', () => {
        const stateObj = {
          attributes: {
            entity_id: [],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.be.undefined;
      });

      it('should return the domain when all entities share the same domain', () => {
        const stateObj = {
          attributes: {
            entity_id: ['light.kitchen', 'light.living_room', 'light.bedroom'],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.equal('light');
      });

      it('should return undefined when entities have different domains', () => {
        const stateObj = {
          attributes: {
            entity_id: ['light.kitchen', 'switch.fan', 'sensor.temperature'],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.be.undefined;
      });

      it('should handle undefined entity_id attribute', () => {
        const stateObj = {
          attributes: {},
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.be.undefined;
      });

      it('should handle entity_id attribute as null', () => {
        const stateObj = {
          attributes: {
            entity_id: null,
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.be.undefined;
      });

      it('should handle a single entity in the array', () => {
        const stateObj = {
          attributes: {
            entity_id: ['media_player.living_room'],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.equal('media_player');
      });

      it('should correctly determine domain with complex entity IDs', () => {
        const stateObj = {
          attributes: {
            entity_id: [
              'climate.upstairs_hvac',
              'climate.downstairs_hvac',
              'climate.basement_hvac',
            ],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.equal('climate');
      });

      it('should identify mixed domains even with similar prefixes', () => {
        // Create a state object with entities that have different but similar domains
        const stateObj = {
          attributes: {
            entity_id: ['light.kitchen', 'lightning.status', 'lights.outdoor'],
          },
        } as any as GroupEntity;

        const result = computeGroupDomain(stateObj);

        expect(result).to.be.undefined;
      });

      it('should handle additional attributes in the state object', () => {
        const stateObj = {
          entity_id: 'group.lights',
          state: 'on',
          attributes: {
            entity_id: ['light.kitchen', 'light.living_room'],
            friendly_name: 'All Lights',
            order: 1,
            auto: true,
          },
        };

        const result = computeGroupDomain(stateObj);

        expect(result).to.equal('light');
      });

      it('should handle entities with dots in their names', () => {
        const stateObj = {
          attributes: {
            entity_id: [
              'sensor.temperature.living_room',
              'sensor.temperature.kitchen',
            ],
          },
        } as any as GroupEntity;

        // Since computeDomain takes everything before the first dot,
        // these should all have domain 'sensor'
        const result = computeGroupDomain(stateObj);

        expect(result).to.equal('sensor');
      });
    });
  });
};
