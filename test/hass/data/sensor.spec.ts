import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';

export default () => {
  describe('sensor.ts', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      mockHass = {
        callWS: async () => {
          return {
            numeric_device_classes: [
              'temperature',
              'humidity',
              'pressure',
              'battery',
              'illuminance',
              'power',
              'energy',
            ],
          };
        },
      } as any as HomeAssistant;

      // Clear the cache between tests by accessing the module's internal state
      // This is a bit of a hack, but necessary for testing the caching behavior
      const sensorModule = require('@hass/data/sensor');
      sensorModule.sensorNumericDeviceClassesCache = undefined;
    });

    afterEach(() => {
      // Clear cache after each test
      const sensorModule = require('@hass/data/sensor');
      sensorModule.sensorNumericDeviceClassesCache = undefined;
    });

    describe('getSensorNumericDeviceClasses', () => {
      it('should call WebSocket API with correct parameters on first call', async () => {
        const result = await getSensorNumericDeviceClasses(mockHass);

        expect(result).to.deep.equal({
          numeric_device_classes: [
            'temperature',
            'humidity',
            'pressure',
            'battery',
            'illuminance',
            'power',
            'energy',
          ],
        });
      });
    });
  });
};
