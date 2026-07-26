import { expect } from 'chai';
import { styleMap } from 'lit/directives/style-map.js';
import * as sinon from 'sinon';

// Import the modules we need to stub
import * as occupancyModule from '@delegates/checks/occupancy';
import * as stateActiveModule from '@homeassistant-extras/hass/common/entity/state_active';
import * as stateColorModule from '@homeassistant-extras/hass/common/entity/state_color';
import { createStateEntityForEntityId as s } from '@test/test-helpers';
import * as customThemeModule from '@theme/custom-theme';
import * as getRgbColorModule from '@theme/get-rgb';
import { renderCardStyles } from '@theme/render/card-styles';
import * as thresholdColorModule from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';

// Helper to create entity information for testing
const createEntityInfo = (
  entityId: string,
  state = 'off',
  attributes = {},
): EntityInformation => ({
  config: { entity_id: entityId },
  state: s(entityId, state, attributes),
});

describe('card-styles.ts', () => {
  let mockHass: any;
  let mockConfig: Config;
  let sandbox: sinon.SinonSandbox;
  let stateActiveStub: sinon.SinonStub;
  let stateColorCssStub: sinon.SinonStub;
  let getThemeColorOverrideStub: sinon.SinonStub;
  let getThresholdResultStub: sinon.SinonStub;
  let getOccupancyCssVarsStub: sinon.SinonStub;
  let getSmokeCssVarsStub: sinon.SinonStub;
  let getGasCssVarsStub: sinon.SinonStub;
  let getWaterCssVarsStub: sinon.SinonStub;
  let stateColorBrightnessStub: sinon.SinonStub;
  let getRgbColorStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
    stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
    stateColorBrightnessStub = sandbox.stub(
      stateColorModule,
      'stateColorBrightness',
    );
    getThemeColorOverrideStub = sandbox.stub(
      customThemeModule,
      'getThemeColorOverride',
    );
    getThresholdResultStub = sandbox.stub(
      thresholdColorModule,
      'getThresholdResult',
    );
    getOccupancyCssVarsStub = sandbox.stub(
      occupancyModule,
      'getOccupancyCssVars',
    );
    getSmokeCssVarsStub = sandbox.stub(occupancyModule, 'getSmokeCssVars');
    getGasCssVarsStub = sandbox.stub(occupancyModule, 'getGasCssVars');
    getWaterCssVarsStub = sandbox.stub(occupancyModule, 'getWaterCssVars');
    getRgbColorStub = sandbox.stub(getRgbColorModule, 'getRgbColor');

    // Default stub behaviors
    stateActiveStub.returns(false);
    stateColorCssStub.returns('var(--primary-color)');
    stateColorBrightnessStub.returns('');
    getThresholdResultStub.returns(undefined);
    getThemeColorOverrideStub.returns('var(--theme-override)');
    getOccupancyCssVarsStub.returns({});
    getSmokeCssVarsStub.returns({});
    getGasCssVarsStub.returns({});
    getWaterCssVarsStub.returns({});
    getRgbColorStub.returns(undefined);

    mockHass = { themes: { darkMode: false } };
    mockConfig = { area: 'test_area' };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('renderCardStyles', () => {
    it('should render basic inactive styles', () => {
      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
      );

      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
      expect(
        getThemeColorOverrideStub.calledWith(
          mockHass,
          entity,
          undefined,
          false,
        ),
      ).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--background-filter': '',
          '--state-color-card-theme': 'var(--theme-override)',
        }),
      );
    });

    it('should handle active state in dark mode', () => {
      mockHass.themes.darkMode = true;
      stateActiveStub.returns(true);
      stateColorCssStub.returns('var(--active-color)');

      const configWithStyles = {
        ...mockConfig,
        styles: { card: { 'border-radius': '8px', padding: '16px' } },
      };

      const entity = createEntityInfo('light.test', 'on');
      const styles = renderCardStyles(
        mockHass,
        configWithStyles,
        entity,
        undefined,
        true,
      );

      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
      expect(
        getThemeColorOverrideStub.calledWith(mockHass, entity, undefined, true),
      ).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': 'var(--active-color)',
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          'border-radius': '8px',
          padding: '16px',
        }),
      );
    });

    it('should disable styles when skip_entity_styles feature is enabled', () => {
      mockHass.themes.darkMode = true;
      stateActiveStub.returns(true);
      stateColorCssStub.returns('var(--active-color)');
      const configWithSkipStyles: Config = {
        ...mockConfig,
        features: ['skip_entity_styles'],
      };

      const entity = createEntityInfo('light.test', 'on');
      const styles = renderCardStyles(
        mockHass,
        configWithSkipStyles,
        entity,
        undefined,
        true,
      );

      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
      expect(
        getThemeColorOverrideStub.calledWith(mockHass, entity, undefined, true),
      ).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined, // Should be undefined due to active being false
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
        }),
      );
    });

    it('should include occupancy styles when occupied', () => {
      const occupancyStyles = {
        '--occupancy-card-border': '3px solid var(--success-color)',
        '--occupancy-card-border-color': 'var(--success-color)',
        '--occupancy-card-animation':
          'occupancy-pulse 2s ease-in-out infinite alternate',
      };
      getOccupancyCssVarsStub.returns(occupancyStyles);

      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        'occupied',
        false,
      );

      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
      expect(
        getThemeColorOverrideStub.calledWith(
          mockHass,
          entity,
          undefined,
          false,
        ),
      ).to.be.true;
      expect(getOccupancyCssVarsStub.calledWith(true, mockConfig.occupancy)).to
        .be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          ...occupancyStyles,
        }),
      );
    });

    it('should include smoke alarm styles when smoke is detected', () => {
      const smokeStyles = {
        '--smoke-card-border': '3px solid var(--error-color)',
      };
      getSmokeCssVarsStub.returns(smokeStyles);
      mockConfig = {
        ...mockConfig,
        smoke: { entities: ['binary_sensor.smoke'] },
      };

      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        'smoke',
        false,
      );

      expect(getSmokeCssVarsStub.calledWith(true, mockConfig.smoke)).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          ...smokeStyles,
        }),
      );
    });

    it('should include gas alarm styles when gas is detected', () => {
      const gasStyles = {
        '--gas-card-border': '3px solid var(--warning-color)',
      };
      getGasCssVarsStub.returns(gasStyles);
      mockConfig = { ...mockConfig, gas: { entities: ['binary_sensor.gas'] } };

      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        'gas',
        false,
      );

      expect(getGasCssVarsStub.calledWith(true, mockConfig.gas)).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          ...gasStyles,
        }),
      );
    });

    it('should include water alarm styles when water is detected', () => {
      const waterStyles = {
        '--water-card-border': '3px solid var(--info-color)',
      };
      getWaterCssVarsStub.returns(waterStyles);
      mockConfig = {
        ...mockConfig,
        water: { entities: ['binary_sensor.water'] },
      };

      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        'water',
        false,
      );

      expect(getWaterCssVarsStub.calledWith(true, mockConfig.water)).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          ...waterStyles,
        }),
      );
    });

    it('should pass threshold result to getThemeColorOverride', () => {
      const thresholdResult = {
        color: 'rgb(255, 0, 0)',
        icon: 'mdi:alert',
      };
      getThresholdResultStub.returns(thresholdResult);
      getThemeColorOverrideStub.returns('rgb(255, 0, 0)');

      const entity = createEntityInfo('sensor.temperature', '25');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
      );

      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
      expect(
        getThemeColorOverrideStub.calledWith(
          mockHass,
          entity,
          thresholdResult,
          false,
        ),
      ).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'rgb(255, 0, 0)',
          '--background-filter': '',
        }),
      );
    });

    it('should use default active when isActive is undefined', () => {
      const entity = createEntityInfo('light.test');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        undefined as any,
      );

      expect(
        getThemeColorOverrideStub.calledWith(
          mockHass,
          entity,
          undefined,
          false,
        ),
      ).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
        }),
      );
    });

    it('should include brightness filter when entity has brightness attribute', () => {
      const entity = createEntityInfo('light.test', 'on', { brightness: 100 });
      stateColorBrightnessStub.returns('brightness(69%)');

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
      );

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': 'brightness(69%)',
        }),
      );
    });

    it('should set empty background filter when entity has no brightness', () => {
      const entity = createEntityInfo('switch.test', 'on');
      stateColorBrightnessStub.returns('');

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
      );

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
        }),
      );
    });

    it('should include threshold color CSS variables when thresholds are provided', () => {
      const entity = createEntityInfo('light.test');
      const thresholds = {
        hot: true,
        humid: false,
        hotColor: 'blue',
        humidColor: undefined,
      };

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
        thresholds,
      );

      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          '--threshold-hot-color': 'blue',
        }),
      );
    });

    it('should include humid threshold CSS variable when humid threshold is triggered with color', () => {
      const entity = createEntityInfo('light.test');
      const thresholds = {
        hot: false,
        humid: true,
        hotColor: undefined,
        humidColor: 'purple',
      };

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
        thresholds,
      );

      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          '--threshold-humid-color': 'purple',
        }),
      );
    });

    it('should include both threshold color CSS variables when both are triggered', () => {
      const entity = createEntityInfo('light.test');
      const thresholds = {
        hot: true,
        humid: true,
        hotColor: 'red',
        humidColor: 'green',
      };

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
        thresholds,
      );

      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
          '--threshold-hot-color': 'red',
          '--threshold-humid-color': 'green',
        }),
      );
    });

    it('should not include threshold CSS variables when thresholds are triggered but no colors provided', () => {
      const entity = createEntityInfo('light.test');
      const thresholds = {
        hot: true,
        humid: true,
        hotColor: undefined,
        humidColor: undefined,
      };

      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        undefined,
        false,
        thresholds,
      );

      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-filter': '',
        }),
      );
    });

    describe('ambient light logic', () => {
      const createAmbientLightState = (
        entityId: string,
        state = 'on',
        attributes = {},
      ): EntityState => s(entityId, state, attributes);

      it('should use ambient light RGB color for theme override when active ambient light exists', () => {
        const entity = createEntityInfo('light.main');
        const ambientLight = createAmbientLightState('light.ambient', 'on', {
          rgb_color: [255, 200, 100],
        });

        stateActiveStub.withArgs(ambientLight).returns(true);
        getRgbColorStub
          .withArgs(ambientLight, '', '', true)
          .returns('rgb(255, 200, 100)');

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [ambientLight],
        );

        expect(getRgbColorStub.calledWith(ambientLight, '', '', true)).to.be
          .true;
        expect(getThemeColorOverrideStub.called).to.be.false;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'rgb(255, 200, 100)',
            '--background-filter': '',
          }),
        );
      });

      it('should fall back to entity theme color when no active ambient light exists', () => {
        const entity = createEntityInfo('light.main');
        const ambientLight = createAmbientLightState('light.ambient', 'off');

        stateActiveStub.withArgs(ambientLight).returns(false);

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [ambientLight],
        );

        expect(getRgbColorStub.called).to.be.false;
        expect(
          getThemeColorOverrideStub.calledWith(
            mockHass,
            entity,
            undefined,
            false,
          ),
        ).to.be.true;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-filter': '',
          }),
        );
      });

      it('should fall back to entity theme color when ambientLightEntities is undefined', () => {
        const entity = createEntityInfo('light.main');

        renderCardStyles(mockHass, mockConfig, entity, undefined, false);

        expect(getRgbColorStub.called).to.be.false;
        expect(
          getThemeColorOverrideStub.calledWith(
            mockHass,
            entity,
            undefined,
            false,
          ),
        ).to.be.true;
      });

      it('should fall back to entity theme color when ambientLightEntities is empty', () => {
        const entity = createEntityInfo('light.main');

        renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [],
        );

        expect(getRgbColorStub.called).to.be.false;
        expect(
          getThemeColorOverrideStub.calledWith(
            mockHass,
            entity,
            undefined,
            false,
          ),
        ).to.be.true;
      });

      it('should fall back to entity theme color when active ambient light has no RGB color', () => {
        const entity = createEntityInfo('light.main');
        const ambientLight = createAmbientLightState('light.ambient', 'on');

        stateActiveStub.withArgs(ambientLight).returns(true);
        getRgbColorStub.withArgs(ambientLight, '', '', true).returns(undefined);

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [ambientLight],
        );

        expect(getRgbColorStub.calledWith(ambientLight, '', '', true)).to.be
          .true;
        expect(
          getThemeColorOverrideStub.calledWith(
            mockHass,
            entity,
            undefined,
            false,
          ),
        ).to.be.true;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-filter': '',
          }),
        );
      });

      it('should use active ambient light state for color calculation instead of entity state', () => {
        const entity = createEntityInfo('light.main', 'off');
        const ambientLight = createAmbientLightState('light.ambient', 'on', {
          rgb_color: [100, 150, 200],
        });

        stateActiveStub.withArgs(ambientLight).returns(true);
        getRgbColorStub
          .withArgs(ambientLight, '', '', true)
          .returns('rgb(100, 150, 200)');
        stateColorCssStub
          .withArgs(ambientLight as any, 'card', false)
          .returns('var(--ambient-color)');
        stateColorBrightnessStub
          .withArgs(ambientLight as any)
          .returns('brightness(80%)');

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [ambientLight],
        );

        // Should use ambient light state for color calculation
        expect(stateColorCssStub.calledWith(ambientLight as any, 'card', false))
          .to.be.true;
        expect(stateColorBrightnessStub.calledWith(ambientLight as any)).to.be
          .true;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'rgb(100, 150, 200)',
            '--background-filter': 'brightness(80%)',
          }),
        );
      });

      it('should use first active ambient light when multiple ambient lights exist', () => {
        const entity = createEntityInfo('light.main');
        const ambientLight1 = createAmbientLightState('light.ambient1', 'off');
        const ambientLight2 = createAmbientLightState('light.ambient2', 'on', {
          rgb_color: [200, 100, 50],
        });
        const ambientLight3 = createAmbientLightState('light.ambient3', 'on', {
          rgb_color: [50, 100, 200],
        });

        stateActiveStub.withArgs(ambientLight1).returns(false);
        stateActiveStub.withArgs(ambientLight2).returns(true);
        stateActiveStub.withArgs(ambientLight3).returns(true);
        getRgbColorStub
          .withArgs(ambientLight2, '', '', true)
          .returns('rgb(200, 100, 50)');

        const styles = renderCardStyles(
          mockHass,
          mockConfig,
          entity,
          undefined,
          false,
          undefined,
          [ambientLight1, ambientLight2, ambientLight3],
        );

        // Should use the first active ambient light (ambientLight2)
        expect(getRgbColorStub.calledWith(ambientLight2, '', '', true)).to.be
          .true;
        expect(getRgbColorStub.calledWith(ambientLight3, '', '', true)).to.be
          .false;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'rgb(200, 100, 50)',
            '--background-filter': '',
          }),
        );
      });
    });
  });
});
