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
          return stateObj.attributes.on_color ?? 'var(--primary-color)';
        }
        return stateObj.attributes.off_color ?? 'var(--disabled-color)';
      });

      getThemeColorOverrideStub.returns('var(--theme-override)');

      // Default to not having features enabled
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
      it('should render basic card styles with inactive state', () => {
        const styles = renderCardStyles(mockHass, mockConfig);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
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

        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': 'yellow',
            '--background-opacity-card': 'var(--opacity-background-active)',
            '--state-color-theme-override': 'var(--theme-override)',
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

        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );
      });

      it('should disable background color when skip_entity_styles feature is enabled', () => {
        // Enable dark mode to make the state normally affect background
        mockHass.themes.darkMode = true;

        // Set hasFeature to return true for skip_entity_styles
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);

        // Create state entity
        const state = createStateEntity('light', 'test', 'on', {
          on_color: 'yellow',
        });

        // Configure stub behaviors for this test
        stateActiveStub.withArgs(sinon.match.any).returns(true);
        stateColorCssStub.withArgs(sinon.match.any).returns('yellow');

        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined, // Should be undefined even though state is active
            '--background-opacity-card': 'var(--opacity-background-inactive)', // Should be inactive due to skipStyles
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );

        // Verify hasFeature was called with the correct parameters
        expect(hasFeatureStub.calledWith(mockConfig, 'skip_entity_styles')).to
          .be.true;
      });

      it('should handle undefined state gracefully', () => {
        const styles = renderCardStyles(mockHass, mockConfig);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );
      });
    });
  });
};
