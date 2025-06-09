import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as sinon from 'sinon';

// Import the modules we need to stub
import * as featureModule from '@config/feature';
import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as customThemeModule from '@theme/custom-theme';
import * as backgroundBitsModule from '@theme/render/background-bits';
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
    let backgroundImageStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
      stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
      getThemeColorOverrideStub = sandbox.stub(
        customThemeModule,
        'getThemeColorOverride',
      );
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
      backgroundImageStub = sandbox.stub(
        backgroundBitsModule,
        'backgroundImage',
      );

      // Default stub behaviors
      stateActiveStub.returns(false);
      stateColorCssStub.returns('var(--primary-color)');
      getThemeColorOverrideStub.returns('var(--theme-override)');
      hasFeatureStub.returns(false);
      backgroundImageStub.returns({
        image: undefined,
        opacity: 'var(--opacity-background-inactive)',
      });

      mockHass = {
        themes: {
          darkMode: false,
        },
        areas: {
          test_area: {},
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
            '--background-image': undefined,
          }),
        );
      });

      it('should include background image from backgroundImage function', () => {
        backgroundImageStub.returns({
          image: 'url(/local/bedroom.jpg)',
          opacity: '0.5',
        });

        const state = createStateEntity('light', 'test', 'on');
        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--background-opacity-card': '0.5',
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': 'url(/local/bedroom.jpg)',
          }),
        );

        expect(backgroundImageStub.calledWith(mockHass, mockConfig, state)).to
          .be.true;
      });

      it('should render active styles in dark mode', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--active-color)');
        backgroundImageStub.returns({
          image: undefined,
          opacity: 'var(--opacity-background-active)',
        });

        const state = createStateEntity('light', 'test', 'on');
        const styles = renderCardStyles(mockHass, mockConfig, state);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': 'var(--active-color)',
            '--background-opacity-card': 'var(--opacity-background-active)',
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': undefined,
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
            '--background-opacity-card': 'var(--opacity-background-inactive)',
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': undefined,
          }),
        );

        expect(hasFeatureStub.calledWith(mockConfig, 'skip_entity_styles')).to
          .be.true;
      });
    });
  });
};
