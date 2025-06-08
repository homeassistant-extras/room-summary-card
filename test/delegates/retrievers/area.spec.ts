import { getArea } from '@delegates/retrievers/area';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import * as sinon from 'sinon';

export default () => {
  describe('area.ts', () => {
    let sandbox: sinon.SinonSandbox;
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Create a sinon sandbox for test isolation
      sandbox = sinon.createSandbox();

      // Mock HomeAssistant instance with only areas
      mockHass = {
        areas: {
          'area-123': {
            area_id: 'area-123',
            name: 'Living Room',
            picture: null,
            icon: 'mdi:sofa',
            aliases: [],
          },
          'area-456': {
            area_id: 'area-456',
            name: 'Kitchen',
            picture: null,
            icon: 'mdi:fridge',
            aliases: [],
          },
        },
      } as unknown as HomeAssistant;
    });

    afterEach(() => {
      // Restore the sandbox to clean up all stubs
      sandbox.restore();
    });

    describe('getArea', () => {
      it('should return area information when a valid area ID is provided', () => {
        const area = getArea(mockHass.areas, 'area-123');

        expect(area).to.exist;
        expect(area).to.deep.equal({
          area_id: 'area-123',
          name: 'Living Room',
          picture: null,
          icon: 'mdi:sofa',
          aliases: [],
        });
      });

      it('should return undefined when an invalid area ID is provided', () => {
        const area = getArea(mockHass.areas, 'nonexistent-area');

        expect(area).to.be.undefined;
      });

      it('should handle empty areas object', () => {
        const hassWithNoAreas = { ...mockHass, areas: {} } as HomeAssistant;

        const area = getArea(hassWithNoAreas.areas, 'area-123');

        expect(area).to.be.undefined;
      });
    });
  });
};
