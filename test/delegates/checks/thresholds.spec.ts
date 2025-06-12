import * as featureModule from '@config/feature';
import { climateThresholds } from '@delegates/checks/thresholds';
import type { Config } from '@type/config';
import type { SensorData } from '@type/sensor';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('climate-thresholds.ts', () => {
    let hasFeatureStub: SinonStub;

    beforeEach(() => {
      hasFeatureStub = stub(featureModule, 'hasFeature');
      hasFeatureStub.returns(false);
    });

    afterEach(() => {
      hasFeatureStub.restore();
    });

    describe('climateThresholds', () => {
      it('should return false for both when skip_climate_styles is enabled', () => {
        hasFeatureStub
          .withArgs(sinon.match.any, 'skip_climate_styles')
          .returns(true);

        const config: Config = { area: 'test' };
        const sensorData: SensorData = { individual: [], averaged: [] };

        const result = climateThresholds(config, sensorData.averaged);

        expect(result).to.deep.equal({ hot: false, humid: false });
      });

      it('should return false when temperature or humidity sensors are missing', () => {
        const config: Config = { area: 'test' };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 85,
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            // Missing humidity sensor
          ],
        };

        const result = climateThresholds(config, sensorData.averaged);

        expect(result).to.deep.equal({ hot: false, humid: false });
      });

      it('should detect hot and humid conditions using default thresholds', () => {
        const config: Config = { area: 'test' };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 85, // Above default 80
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 65, // Above default 60
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
        };

        const result = climateThresholds(config, sensorData.averaged);

        expect(result).to.deep.equal({ hot: true, humid: true });
      });

      it('should use custom thresholds when provided', () => {
        const config: Config = {
          area: 'test',
          thresholds: {
            temperature: 75,
            humidity: 50,
          },
        };
        const sensorData: SensorData = {
          individual: [],
          averaged: [
            {
              device_class: 'temperature',
              average: 78, // Above custom 75
              uom: '°F',
              states: [],
              domain: 'sensor',
            },
            {
              device_class: 'humidity',
              average: 45, // Below custom 50
              uom: '%',
              states: [],
              domain: 'sensor',
            },
          ],
        };

        const result = climateThresholds(config, sensorData.averaged);

        expect(result).to.deep.equal({ hot: true, humid: false });
      });
    });
  });
};
