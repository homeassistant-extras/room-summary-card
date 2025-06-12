import * as featureModule from '@config/feature';
import * as commonStyleModule from '@theme/render/common-style';
import { renderTextStyles } from '@theme/render/text-styles';
import type { Config, EntityInformation } from '@type/config';
import { expect } from 'chai';
import { nothing } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import * as sinon from 'sinon';

// Helper to create entity information for testing
const createEntityInfo = (
  domain: string,
  entityId: string,
  state = 'off',
  attributes = {},
): EntityInformation => ({
  config: { entity_id: `${domain}.${entityId}` },
  state: {
    entity_id: `${domain}.${entityId}`,
    state,
    attributes: {
      friendly_name: entityId.replace(/_/g, ' '),
      ...attributes,
    },
    domain,
  },
});

export default () => {
  describe('text-styles.ts', () => {
    let mockHass: any;
    let mockConfig: Config;
    let sandbox: sinon.SinonSandbox;
    let hasFeatureStub: sinon.SinonStub;
    let getStyleDataStub: sinon.SinonStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
      getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');

      // Default behavior for stubs
      hasFeatureStub.returns(false);

      mockHass = {
        themes: {
          darkMode: false,
          theme: 'default',
        },
      };

      mockConfig = {
        area: 'test_area',
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('renderTextStyles', () => {
      it('should return nothing when skip_entity_styles is enabled or no style data', () => {
        const entity = createEntityInfo('light', 'test', 'on');

        // Test skip_entity_styles feature
        hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);
        let result = renderTextStyles(mockHass, mockConfig, entity);
        expect(result).to.equal(nothing);

        // Test null style data
        hasFeatureStub.returns(false);
        getStyleDataStub.returns(null);
        result = renderTextStyles(mockHass, mockConfig, entity);
        expect(result).to.equal(nothing);

        // Test inactive entity
        getStyleDataStub.returns({
          active: false,
          cssColor: 'var(--disabled-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'inactive',
        });
        result = renderTextStyles(mockHass, mockConfig, entity);
        expect(result).to.equal(nothing);
      });

      it('should return style map for active entities with undefined values handled', () => {
        const entity = createEntityInfo('light', 'test', 'on');

        // Test with all values present
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });

        let result = renderTextStyles(mockHass, mockConfig, entity);
        expect(result).to.deep.equal(
          styleMap({
            '--text-color': 'var(--primary-color)',
            '--state-color-text-theme': 'var(--theme-override)',
          }),
        );

        // Test with undefined values
        getStyleDataStub.returns({
          active: true,
          cssColor: undefined,
          themeOverride: undefined,
          activeClass: 'active',
        });

        result = renderTextStyles(mockHass, mockConfig, entity);
        expect(result).to.deep.equal(
          styleMap({
            '--text-color': undefined,
            '--state-color-text-theme': undefined,
          }),
        );

        expect(getStyleDataStub.calledWith(mockHass, 'text', entity)).to.be
          .true;
      });

      it('should spread config.styles.title when active and present', () => {
        const entity = createEntityInfo('light', 'test', 'on');
        mockConfig.styles = {
          title: { 'font-size': '18px', color: 'red' },
        };

        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });

        const result = renderTextStyles(mockHass, mockConfig, entity);

        expect(result).to.deep.equal(
          styleMap({
            '--text-color': 'var(--primary-color)',
            '--state-color-text-theme': 'var(--theme-override)',
            'font-size': '18px',
            color: 'red',
          }),
        );
      });
    });
  });
};
