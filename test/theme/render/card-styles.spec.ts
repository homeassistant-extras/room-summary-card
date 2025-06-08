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
      sandbox = sinon.createSandbox();

      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
      stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
      getThemeColorOverrideStub = sandbox.stub(
        customThemeModule,
        'getThemeColorOverride',
      );
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');

      // Default stub behaviors
      stateActiveStub.returns(false);
      stateColorCssStub.returns('var(--primary-color)');
      getThemeColorOverrideStub.returns('var(--theme-override)');
      hasFeatureStub.returns(false);

      mockHass = {
        themes: {
          darkMode: false,
        },
      };

      mockConfig = {
        area: 'test_area',
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('renderCardStyles', () => {
      it('should render basic inactive styles in light mode', () => {
        const styles = renderCardStyles(mockHass, mockConfig);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-card-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should render active styles in dark mode', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--active-color)');

        const state = createStateEntity('light', 'test', 'on');
        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': 'var(--active-color)',
            '--background-opacity-card': 'var(--opacity-background-active)',
            '--state-color-card-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should not set background color in light mode even when active', () => {
        mockHass.themes.darkMode = false;
        stateActiveStub.returns(true);

        const state = createStateEntity('light', 'test', 'on');
        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-card-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should disable styles when skip_entity_styles feature is enabled', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--active-color)');
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);

        const state = createStateEntity('light', 'test', 'on');
        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined, // Should be undefined due to skipStyles
            '--background-opacity-card': 'var(--opacity-background-inactive)', // Should be inactive due to skipStyles
            '--state-color-card-theme': 'var(--theme-override)',
          }),
        );

        expect(hasFeatureStub.calledWith(mockConfig, 'skip_entity_styles')).to
          .be.true;
      });

      it('should handle undefined state gracefully', () => {
        const styles = renderCardStyles(mockHass, mockConfig);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-card-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should call theme override with correct parameters', () => {
        const state = createStateEntity('light', 'test', 'on');
        renderCardStyles(mockHass, mockConfig, state);

        expect(getThemeColorOverrideStub.calledWith(mockHass, state, false)).to
          .be.true;
      });

      it('should call stateColorCss only in dark mode', () => {
        const state = createStateEntity('light', 'test', 'on');

        // Light mode - should not call stateColorCss
        mockHass.themes.darkMode = false;
        renderCardStyles(mockHass, mockConfig, state);
        expect(stateColorCssStub.called).to.be.false;

        // Reset stub
        stateColorCssStub.resetHistory();

        // Dark mode - should call stateColorCss
        mockHass.themes.darkMode = true;
        renderCardStyles(mockHass, mockConfig, state);
        expect(stateColorCssStub.calledWith(state, 'card')).to.be.true;
      });
    });
  });
};
