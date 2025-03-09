import { getDevice } from '@delegates/retrievers/device';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import * as sinon from 'sinon';

export default () => {
  describe('device.ts', () => {
    let sandbox: sinon.SinonSandbox;
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Create a sinon sandbox for test isolation
      sandbox = sinon.createSandbox();

      // Mock HomeAssistant instance with only devices
      mockHass = {
        devices: {
          'device-123': {
            id: 'device-123',
            area_id: 'area-123',
            name: 'Living Room Light',
            name_by_user: 'Main Light',
            manufacturer: 'Philips',
            model: 'Hue',
            entry_type: 'service',
            disabled_by: null,
            config_entries: ['config-1'],
          },
          'device-456': {
            id: 'device-456',
            area_id: 'area-456',
            name: 'Kitchen Sensor',
            name_by_user: 'Temperature Sensor',
            manufacturer: 'Aqara',
            model: 'WSDCGQ11LM',
            entry_type: 'service',
            disabled_by: null,
            config_entries: ['config-2'],
          },
        },
      } as unknown as HomeAssistant;
    });

    afterEach(() => {
      // Restore the sandbox to clean up all stubs
      sandbox.restore();
    });

    describe('getDevice', () => {
      it('should return device information when a valid device ID is provided', () => {
        const device = getDevice(mockHass, 'device-123');

        expect(device).to.exist;
        expect(device).to.deep.equal({
          id: 'device-123',
          area_id: 'area-123',
          name: 'Living Room Light',
          name_by_user: 'Main Light',
          manufacturer: 'Philips',
          model: 'Hue',
          entry_type: 'service',
          disabled_by: null,
          config_entries: ['config-1'],
        });
      });

      it('should return undefined when an invalid device ID is provided', () => {
        const device = getDevice(mockHass, 'nonexistent-device');

        expect(device).to.be.undefined;
      });

      it('should handle empty devices object', () => {
        const hassWithNoDevices = {
          ...mockHass,
          devices: {},
        } as HomeAssistant;

        const device = getDevice(hassWithNoDevices, 'device-123');

        expect(device).to.be.undefined;
      });

      it('should handle null or undefined devices', () => {
        const hassWithNullDevices = {
          ...mockHass,
          devices: null,
        } as unknown as HomeAssistant;

        expect(() => getDevice(hassWithNullDevices, 'device-123')).to.throw();
      });
    });
  });
};
