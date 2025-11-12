import * as featureModule from '@config/feature';
import * as commonStyleModule from '@theme/render/common-style';
import { renderTextStyles } from '@theme/render/text-styles';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
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
    it('should return nothing when skip_entity_styles is enabled', () => {
      const entity = createEntityInfo('light', 'test', 'on');
      hasFeatureStub.withArgs(mockConfig, 'skip_entity_styles').returns(true);
      const result = renderTextStyles(mockHass, mockConfig, entity);
      expect(result).to.equal(nothing);
    });

    it('should return nothing when styleData is null', () => {
      const entity = createEntityInfo('light', 'test', 'on');
      hasFeatureStub.returns(false);
      getStyleDataStub.returns(null);
      const result = renderTextStyles(mockHass, mockConfig, entity);
      expect(result).to.equal(nothing);
      expect(getStyleDataStub.calledWith(mockHass, 'text', entity)).to.be.true;
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

      expect(getStyleDataStub.calledWith(mockHass, 'text', entity)).to.be.true;
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

    it('should return styleMap with config.styles.title when inactive but styleData exists', () => {
      const entity = createEntityInfo('light', 'test', 'off');
      mockConfig.styles = {
        title: { 'font-size': '16px', 'font-weight': 'bold' },
      };

      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          'font-size': '16px',
          'font-weight': 'bold',
        }),
      );
    });

    it('should return styleMap with empty object when inactive and no config.styles.title', () => {
      const entity = createEntityInfo('light', 'test', 'off');
      // No config.styles.title set

      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      // When active is false but styleData exists, should return styleMap with spread config.styles?.title
      // Since config.styles?.title is undefined, spreading it gives empty object
      expect(result).to.exist;
      expect(result).to.not.equal(nothing);
      // Verify it's a styleMap result by checking it can be used
      expect(typeof result).to.equal('object');
    });
  });
});
