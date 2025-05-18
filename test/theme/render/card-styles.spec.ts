import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as sinon from 'sinon';

// Import the modules we need to stub
import * as featureModule from '@config/feature';
import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as customThemeModule from '@theme/custom-theme';
import { renderCardStyles } from '@theme/render/card-styles';
import type { Config, EntityState } from '@type/config';

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
  describe('card-styles.ts', () => {
    let mockHass: any;
    let mockConfig: Config;
    let sandbox: sinon.SinonSandbox;
    let stateActiveStub: sinon.SinonStub;
    let stateColorCssStub: sinon.SinonStub;
    let getThemeColorOverrideStub: sinon.SinonStub;
    let hasFeatureStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a sinon sandbox for managing stubs
      sandbox = sinon.createSandbox();

      // Create stubs for the imported functions
      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
      stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
      getThemeColorOverrideStub = sandbox.stub(
        customThemeModule,
        'getThemeColorOverride',
      );
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');

      // Default behavior for stubs
      stateActiveStub.callsFake((stateObj: any) => {
        return (
          ['on', 'true', 'home', 'open'].includes(stateObj.state) ||
          Number(stateObj.state) > 0
        );
      });

      stateColorCssStub.callsFake((stateObj: any) => {
        if (stateActiveStub(stateObj)) {
          return stateObj.attributes.on_color || 'var(--primary-color)';
        }
        return stateObj.attributes.off_color || 'var(--disabled-color)';
      });

      getThemeColorOverrideStub.returns('var(--theme-override)');

      // Default to not having skip_climate_styles feature
      hasFeatureStub.returns(false);

      // Set up mock Home Assistant instance
      mockHass = {
        themes: {
          darkMode: false,
          themes: {},
        },
        selectedTheme: null,
      };

      // Set up mock config
      mockConfig = {
        area: 'test_area',
      };
    });

    afterEach(() => {
      // Restore the sandbox to clean up stubs
      sandbox.restore();
    });

    describe('renderCardStyles', () => {
      it('should render basic card styles with no border when sensor array is empty', () => {
        const styles = renderCardStyles(mockHass, mockConfig, []);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );
      });

      it('should render card styles with borders when temperature exceeds threshold', () => {
        // Create temperature sensor with value above threshold
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });

        // Create humidity sensor with value below threshold
        const humidSensor = createStateEntity('sensor', 'humidity', '50', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: '5px solid var(--error-color)',
            borderTop: '5px solid var(--error-color)',
            borderRight: '5px solid var(--error-color)',
            borderBottom: '5px solid var(--error-color)',
          }),
        );
      });

      it('should render card styles with borders when humidity exceeds threshold', () => {
        // Create temperature sensor with value below threshold
        const tempSensor = createStateEntity('sensor', 'temperature', '75', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });

        // Create humidity sensor with value above threshold
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: '5px solid var(--info-color)',
            borderTop: '5px solid var(--info-color)',
            borderRight: '5px solid var(--info-color)',
            borderBottom: '5px solid var(--info-color)',
          }),
        );
      });

      it('should render card styles with different borders when both sensors exceed thresholds', () => {
        // Create temperature sensor with value above threshold
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });

        // Create humidity sensor with value above threshold
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: '5px solid var(--error-color)',
            borderTop: '5px solid var(--error-color)',
            borderRight: '5px solid var(--info-color)',
            borderBottom: '5px solid var(--info-color)',
          }),
        );
      });

      it('should use default thresholds when not provided in attributes', () => {
        // Create temperature sensor with value above default threshold (80) but no threshold in attributes
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
        });

        // Create humidity sensor with value above default threshold (60) but no threshold in attributes
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: '5px solid var(--error-color)',
            borderTop: '5px solid var(--error-color)',
            borderRight: '5px solid var(--info-color)',
            borderBottom: '5px solid var(--info-color)',
          }),
        );
      });

      it('should handle missing device_class in sensors correctly', () => {
        // Create sensors without device_class attributes
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        // Should not apply any border styling without proper device_class
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );
      });

      it('should set background color when dark mode is enabled and state is active', () => {
        // Enable dark mode in mockHass
        mockHass.themes.darkMode = true;

        // Create state entity
        const state = createStateEntity('light', 'test', 'on', {
          on_color: 'yellow',
        });

        // Configure stub behaviors for this test
        stateActiveStub.withArgs(sinon.match.any).returns(true);
        stateColorCssStub.withArgs(sinon.match.any).returns('yellow');

        // Create temperature and humidity sensors
        const tempSensor = createStateEntity('sensor', 'temperature', '75', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '55', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          [tempSensor, humidSensor],
          state,
        );

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': 'yellow',
            '--background-opacity-card': 'var(--opacity-background-active)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );
      });

      it('should not set background color when dark mode is disabled even if state is active', () => {
        // Ensure dark mode is disabled
        mockHass.themes.darkMode = false;

        // Create state entity
        const state = createStateEntity('light', 'test', 'on', {
          on_color: 'yellow',
        });

        // Configure stub behaviors for this test
        stateActiveStub.withArgs(sinon.match.any).returns(true);
        stateColorCssStub.withArgs(sinon.match.any).returns('yellow');

        // Create temperature and humidity sensors
        const tempSensor = createStateEntity('sensor', 'temperature', '75', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '55', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          [tempSensor, humidSensor],
          state,
        );

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );
      });

      it('should not render border styles when skip_climate_styles feature is enabled', () => {
        // Set hasFeature to return true for skip_climate_styles
        hasFeatureStub
          .withArgs(mockConfig, 'skip_climate_styles')
          .returns(true);

        // Create temperature and humidity sensors
        const tempSensor = createStateEntity('sensor', 'temperature', '85', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '65', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
        ]);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );

        // Verify hasFeature was called with the correct parameters
        expect(hasFeatureStub.calledWith(mockConfig, 'skip_climate_styles')).to
          .be.true;
      });

      it('should handle additional sensors in the array that are not temperature or humidity', () => {
        // Create temperature and humidity sensors
        const tempSensor = createStateEntity('sensor', 'temperature', '75', {
          device_class: 'temperature',
          temperature_threshold: 80,
        });
        const humidSensor = createStateEntity('sensor', 'humidity', '55', {
          device_class: 'humidity',
          humidity_threshold: 60,
        });
        // Add some other sensor types
        const luxSensor = createStateEntity('sensor', 'illuminance', '250', {
          device_class: 'illuminance',
        });
        const battSensor = createStateEntity('sensor', 'battery', '80', {
          device_class: 'battery',
        });

        const styles = renderCardStyles(mockHass, mockConfig, [
          tempSensor,
          humidSensor,
          luxSensor,
          battSensor,
        ]);

        // Should still work correctly with the extra sensors
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
            borderLeft: undefined,
            borderTop: undefined,
            borderRight: undefined,
            borderBottom: undefined,
          }),
        );
      });
    });
  });
};
