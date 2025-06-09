import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as sinon from 'sinon';

// Import the modules we need to stub
import * as featureModule from '@config/feature';
import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as backgroundBitsModule from '@theme/background/background-bits';
import * as customThemeModule from '@theme/custom-theme';
import { renderCardStyles } from '@theme/render/card-styles';
import type { Config, EntityState } from '@type/config';

export default () => {
  describe('card-styles.ts', () => {
    let mockHass: any;
    let mockConfig: Config;
    let sandbox: sinon.SinonSandbox;
    let stateActiveStub: sinon.SinonStub;
    let stateColorCssStub: sinon.SinonStub;
    let getThemeColorOverrideStub: sinon.SinonStub;
    let hasFeatureStub: sinon.SinonStub;
    let getBackgroundOpacityStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
      stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
      getThemeColorOverrideStub = sandbox.stub(
        customThemeModule,
        'getThemeColorOverride',
      );
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
      getBackgroundOpacityStub = sandbox.stub(
        backgroundBitsModule,
        'getBackgroundOpacity',
      );

      // Default stub behaviors
      stateActiveStub.returns(false);
      stateColorCssStub.returns('var(--primary-color)');
      getThemeColorOverrideStub.returns('var(--theme-override)');
      hasFeatureStub.returns(false);
      getBackgroundOpacityStub.returns('var(--opacity-background-inactive)');

      mockHass = { themes: { darkMode: false } };
      mockConfig = { area: 'test_area' };
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('renderCardStyles', () => {
      it('should render basic styles and call getBackgroundOpacity', () => {
        getBackgroundOpacityStub.returns({
          '--background-opacity-card': 'var(--opacity-background-inactive)',
        });

        const styles = renderCardStyles(mockHass, mockConfig);

        expect(
          getBackgroundOpacityStub.calledWith(mockHass, mockConfig, undefined),
        ).to.be.true;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': undefined,
            '--background-opacity-card': 'var(--opacity-background-inactive)',
          }),
        );
      });

      it('should include background image when provided', () => {
        const image = '/local/bedroom.jpg';
        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
        } as EntityState;

        getBackgroundOpacityStub.returns({
          '--background-opacity-card': '0.5',
        });

        const styles = renderCardStyles(mockHass, mockConfig, image, mockState);

        expect(
          getBackgroundOpacityStub.calledWith(mockHass, mockConfig, mockState),
        ).to.be.true;
        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined,
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': 'url(/local/bedroom.jpg)',
            '--background-opacity-card': '0.5',
          }),
        );
      });

      it('should render active styles in dark mode when not skipping styles', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--active-color)');
        getBackgroundOpacityStub.returns({
          '--background-opacity-card': 'var(--opacity-background-active)',
        });

        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
        } as EntityState;
        const styles = renderCardStyles(mockHass, mockConfig, null, mockState);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': 'var(--active-color)',
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': undefined,
            '--background-opacity-card': 'var(--opacity-background-active)',
          }),
        );
      });

      it('should disable background color when skip_entity_styles is enabled', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--active-color)');
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);
        getBackgroundOpacityStub.returns({
          '--background-opacity-card': 'var(--opacity-background-active)',
          '--opacity-theme': undefined,
        });

        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
        } as EntityState;
        const styles = renderCardStyles(mockHass, mockConfig, null, mockState);

        expect(styles).to.deep.equal(
          styleMap({
            '--background-color-card': undefined, // Should be undefined due to skipStyles
            '--state-color-card-theme': 'var(--theme-override)',
            '--background-image': undefined,
            '--background-opacity-card': 'var(--opacity-background-active)',
            '--opacity-theme': undefined,
          }),
        );
      });
    });
  });
};
