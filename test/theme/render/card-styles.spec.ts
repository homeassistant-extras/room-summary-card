import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as sinon from 'sinon';

// Import the modules we need to stub
import * as featureModule from '@config/feature';
import * as occupancyModule from '@delegates/checks/occupancy';
import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as backgroundBitsModule from '@theme/background/background-bits';
import * as customThemeModule from '@theme/custom-theme';
import { renderCardStyles } from '@theme/render/card-styles';
import * as thresholdColorModule from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';

// Helper to create entity information for testing
const createEntityInfo = (
  entityId: string,
  state = 'off',
  attributes = {},
): EntityInformation => ({
  config: { entity_id: entityId },
  state: {
    entity_id: entityId,
    state,
    attributes,
    domain: entityId.split('.')[0] || 'unknown',
  },
});

describe('card-styles.ts', () => {
  let mockHass: any;
  let mockConfig: Config;
  let sandbox: sinon.SinonSandbox;
  let stateActiveStub: sinon.SinonStub;
  let stateColorCssStub: sinon.SinonStub;
  let getThemeColorOverrideStub: sinon.SinonStub;
  let getThresholdResultStub: sinon.SinonStub;
  let hasFeatureStub: sinon.SinonStub;
  let getBackgroundOpacityStub: sinon.SinonStub;
  let getOccupancyCssVarsStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
    stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
    getThemeColorOverrideStub = sandbox.stub(
      customThemeModule,
      'getThemeColorOverride',
    );
    getThresholdResultStub = sandbox.stub(
      thresholdColorModule,
      'getThresholdResult',
    );
    hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
    getBackgroundOpacityStub = sandbox.stub(
      backgroundBitsModule,
      'getBackgroundOpacity',
    );
    getOccupancyCssVarsStub = sandbox.stub(
      occupancyModule,
      'getOccupancyCssVars',
    );

    // Default stub behaviors
    stateActiveStub.returns(false);
    stateColorCssStub.returns('var(--primary-color)');
    getThresholdResultStub.returns(undefined);
    getThemeColorOverrideStub.returns('var(--theme-override)');
    hasFeatureStub.returns(false);
    getBackgroundOpacityStub.returns({
      '--background-opacity-card': 'var(--opacity-background-inactive)',
    });
    getOccupancyCssVarsStub.returns({});

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
        false,
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
      expect(getBackgroundOpacityStub.calledWith(mockConfig, false)).to.be.true;
      expect(getOccupancyCssVarsStub.calledWith(false, mockConfig.occupancy)).to
        .be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-image': undefined,
          '--background-opacity-card': 'var(--opacity-background-inactive)',
        }),
      );
    });

    it('should handle background image and active state in dark mode', () => {
      mockHass.themes.darkMode = true;
      stateActiveStub.returns(true);
      stateColorCssStub.returns('var(--active-color)');
      getBackgroundOpacityStub.returns({
        '--background-opacity-card': '0.5',
      });

      const configWithStyles = {
        ...mockConfig,
        styles: { card: { 'border-radius': '8px', padding: '16px' } },
      };

      const entity = createEntityInfo('light.test', 'on');
      const image = '/local/bedroom.jpg';
      const styles = renderCardStyles(
        mockHass,
        configWithStyles,
        entity,
        false,
        image,
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
          '--background-image': 'url(/local/bedroom.jpg)',
          '--background-opacity-card': '0.5',
          'border-radius': '8px',
          padding: '16px',
        }),
      );
    });

    it('should disable styles when skip_entity_styles feature is enabled', () => {
      mockHass.themes.darkMode = true;
      stateActiveStub.returns(true);
      stateColorCssStub.returns('var(--active-color)');
      hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);
      getBackgroundOpacityStub.returns({
        '--background-opacity-card': 'var(--opacity-background-active)',
      });

      const entity = createEntityInfo('light.test', 'on');
      const styles = renderCardStyles(
        mockHass,
        mockConfig,
        entity,
        false,
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
          '--background-image': undefined,
          '--background-opacity-card': 'var(--opacity-background-active)',
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
        true,
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
      expect(getOccupancyCssVarsStub.calledWith(true, mockConfig.occupancy)).to
        .be.true;
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          '--state-color-card-theme': 'var(--theme-override)',
          '--background-image': undefined,
          '--background-opacity-card': 'var(--opacity-background-inactive)',
          ...occupancyStyles,
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
        false,
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
          '--background-image': undefined,
          '--background-opacity-card': 'var(--opacity-background-inactive)',
        }),
      );
    });
  });
});
