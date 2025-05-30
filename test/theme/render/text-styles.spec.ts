import * as featureModule from '@config/feature';
import * as commonStyleModule from '@theme/render/common-style';
import { renderTextStyles } from '@theme/render/text-styles';
import type { Config, EntityState } from '@type/config';
import { expect } from 'chai';
import { nothing } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
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
  describe('text-styles.ts', () => {
    let mockHass: any;
    let mockConfig: Config;
    let sandbox: sinon.SinonSandbox;
    let hasFeatureStub: sinon.SinonStub;
    let getStyleDataStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a sinon sandbox for managing stubs
      sandbox = sinon.createSandbox();

      // Create stubs for the imported functions
      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
      getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');

      // Default behavior for stubs
      hasFeatureStub.returns(false);

      // Set up mock Home Assistant instance
      mockHass = {
        themes: {
          darkMode: false,
          theme: 'default',
        },
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

    describe('renderTextStyles', () => {
      it('should return nothing when skip_entity_styles feature is enabled', () => {
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);
        const state = createStateEntity('light', 'test', 'on');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.equal(nothing);
        expect(hasFeatureStub.calledWith(mockConfig, 'skip_entity_styles')).to
          .be.true;
      });

      it('should return nothing when getStyleData returns null', () => {
        getStyleDataStub.returns(null);
        const state = createStateEntity('light', 'test', 'on');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.equal(nothing);
        expect(getStyleDataStub.calledWith(mockHass, state)).to.be.true;
      });

      it('should return nothing when entity is inactive', () => {
        getStyleDataStub.returns({
          active: false,
          cssColor: 'var(--disabled-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'inactive',
        });
        const state = createStateEntity('light', 'test', 'off');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.equal(nothing);
      });

      it('should return style map when entity is active', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.deep.equal(
          styleMap({
            '--text-color': 'var(--primary-color)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );
      });

      it('should handle undefined cssColor in active state', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: undefined,
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.deep.equal(
          styleMap({
            '--text-color': undefined,
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );
      });

      it('should handle undefined themeOverride in active state', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: undefined,
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderTextStyles(mockHass, mockConfig, state);

        expect(result).to.deep.equal(
          styleMap({
            '--text-color': 'var(--primary-color)',
            '--state-color-theme-override': undefined,
          }),
        );
      });

      it('should call getStyleData with correct parameters', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
        const state = createStateEntity('switch', 'test', 'on');

        renderTextStyles(mockHass, mockConfig, state);

        expect(getStyleDataStub.calledWith(mockHass, state)).to.be.true;
      });
    });
  });
};
