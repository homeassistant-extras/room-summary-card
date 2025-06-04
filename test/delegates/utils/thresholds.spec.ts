import * as featureModule from '@config/feature';
import { hitThresholds } from '@delegates/utils/thresholds';
import type { Config, EntityState } from '@type/config';
import { expect } from 'chai';
import * as sinon from 'sinon';

// Helper to create entity states for testing
const createStateEntity = (
  domain: string,
  entity_id: string,
  state = 'off',
  attributes = {},
) => {
  return {
    entity_id: `${domain}.${entity_id}`,
    state,
    attributes: {
      friendly_name: entity_id.replace(/_/g, ' '),
      ...attributes,
    },
    domain,
  } as EntityState;
};

export default () => {
  describe('threshold.ts', () => {
    let mockConfig: Config;
    let sandbox: sinon.SinonSandbox;
    let hasFeatureStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a sinon sandbox for managing stubs
      sandbox = sinon.createSandbox();

      // Create stubs for the imported functions
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');

      // Default to not having features enabled
      hasFeatureStub.returns(false);

      // Set up mock config
      mockConfig = {
        area: 'test_area',
      };
    });

    afterEach(() => {
      // Restore the sandbox to clean up stubs
      sandbox.restore();
    });

    describe('hitThresholds', () => {
      it('should return false for both thresholds when sensors array is empty', () => {
        const result = hitThresholds(mockConfig, []);

        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should return false when temperature sensor is missing', () => {
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [humidSensor]);

        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should return false when humidity sensor is missing', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });

        const result = hitThresholds(mockConfig, [tempSensor]);

        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should return true for temperature when exceeding threshold', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '50', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: true,
          overHumid: false,
        });
      });

      it('should return true for humidity when exceeding threshold', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '75', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: true,
        });
      });

      it('should return true for both when both exceed thresholds', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: true,
          overHumid: true,
        });
      });

      it('should use default thresholds when not provided in attributes', () => {
        // Temperature 85 > default 80, Humidity 65 > default 60
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: true,
          overHumid: true,
        });
      });

      it('should use default temperature threshold of 80 when not specified', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '79', {
          device_class: 'temperature',
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '50', {
          device_class: 'humidity',
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result.overTemp).to.be.false; // 79 <= 80 (default)
      });

      it('should use default humidity threshold of 60 when not specified', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '70', {
          device_class: 'temperature',
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '59', {
          device_class: 'humidity',
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result.overHumid).to.be.false; // 59 <= 60 (default)
      });

      it('should return false for both when skip_climate_styles feature is enabled', () => {
        // Set hasFeature to return true for skip_climate_styles
        hasFeatureStub
          .withArgs(mockConfig, 'skip_climate_styles')
          .returns(true);

        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });

        // Verify hasFeature was called with the correct parameters
        expect(hasFeatureStub.calledWith(mockConfig, 'skip_climate_styles')).to
          .be.true;
      });

      it('should handle missing device_class in sensors correctly', () => {
        // Create sensors without device_class attributes
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        // Should return false when sensors don't have proper device_class
        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should handle additional sensors in the array correctly', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '50', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });
        // Add some other sensor types that should be ignored
        const luxSensor = createStateEntity('sensor', 'illuminance', '250', {
          device_class: 'illuminance',
        });
        const battSensor = createStateEntity('sensor', 'battery', '80', {
          device_class: 'battery',
        });

        const result = hitThresholds(mockConfig, [
          tempSensor,
          humidSensor,
          luxSensor,
          battSensor,
        ]);

        expect(result).to.deep.equal({
          overTemp: true,
          overHumid: false,
        });
      });

      it('should handle non-numeric sensor states gracefully', () => {
        const tempSensor = createStateEntity(
          'sensor',
          'temperature',
          'unknown',
          {
            device_class: 'temperature',
            temperature_threshold: 80,
          },
        );
        const humidSensor = createStateEntity(
          'sensor',
          'humidity',
          'unavailable',
          {
            device_class: 'humidity',
            humidity_threshold: 60,
          },
        );

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        // Should return false when sensor states are not numeric
        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should handle edge case values correctly', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '80', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '60', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        // Should return false when values equal thresholds (not greater than)
        expect(result).to.deep.equal({
          overTemp: false,
          overHumid: false,
        });
      });

      it('should handle custom thresholds correctly', () => {
        const tempSensor = createStateEntity('sensor', 'temperature', '70', {
          device_class: 'temperature',
          temperature_threshold: 65, // Custom low threshold
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '80', {
          device_class: 'humidity',
          humidity_threshold: 75, // Custom high threshold
        });

        const result = hitThresholds(mockConfig, [tempSensor, humidSensor]);

        expect(result).to.deep.equal({
          overTemp: true, // 70 > 65
          overHumid: true, // 80 > 75
        });
      });
    });
  });
};
