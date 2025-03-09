import { getEntity } from '@delegates/retrievers/entity';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import * as sinon from 'sinon';

export default () => {
  describe('entity.ts', () => {
    let sandbox: sinon.SinonSandbox;
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Create a sinon sandbox for test isolation
      sandbox = sinon.createSandbox();

      // Mock HomeAssistant instance with only entities
      mockHass = {
        entities: {
          'light.living_room': {
            entity_id: 'light.living_room',
            device_id: 'device-123',
            area_id: 'area-123',
            name: 'Living Room Light',
            icon: 'mdi:ceiling-light',
            disabled_by: null,
            entity_category: null,
            hidden_by: null,
          },
          'sensor.kitchen_temperature': {
            entity_id: 'sensor.kitchen_temperature',
            device_id: 'device-456',
            area_id: 'area-456',
            name: 'Kitchen Temperature',
            icon: 'mdi:thermometer',
            disabled_by: null,
            entity_category: null,
            hidden_by: null,
          },
        },
      } as unknown as HomeAssistant;
    });

    afterEach(() => {
      // Restore the sandbox to clean up all stubs
      sandbox.restore();
    });

    describe('getEntity', () => {
      it('should return entity information when a valid entity ID is provided', () => {
        const entity = getEntity(mockHass, 'light.living_room');

        expect(entity).to.exist;
        expect(entity).to.deep.equal({
          entity_id: 'light.living_room',
          device_id: 'device-123',
          area_id: 'area-123',
          name: 'Living Room Light',
          icon: 'mdi:ceiling-light',
          disabled_by: null,
          entity_category: null,
          hidden_by: null,
        });
      });

      it('should return undefined when an invalid entity ID is provided', () => {
        const entity = getEntity(mockHass, 'nonexistent.entity');

        expect(entity).to.be.undefined;
      });

      it('should handle empty entities object', () => {
        const hassWithNoEntities = {
          ...mockHass,
          entities: {},
        } as HomeAssistant;

        const entity = getEntity(hassWithNoEntities, 'light.living_room');

        expect(entity).to.be.undefined;
      });

      it('should handle null or undefined entities', () => {
        const hassWithNullEntities = {
          ...mockHass,
          entities: null,
        } as unknown as HomeAssistant;

        expect(() =>
          getEntity(hassWithNullEntities, 'light.living_room'),
        ).to.throw();
      });
    });
  });
};
