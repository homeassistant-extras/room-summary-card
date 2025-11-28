import * as featureModule from '@config/feature';
import * as stateColorModule from '@hass/common/entity/state_color';
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
  let stateColorBrightnessStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    hasFeatureStub = sandbox.stub(featureModule, 'hasFeature');
    getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');
    stateColorBrightnessStub = sandbox.stub(
      stateColorModule,
      'stateColorBrightness',
    );

    // Default behavior for stubs
    hasFeatureStub.returns(false);
    stateColorBrightnessStub.returns('');

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
          filter: '',
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
          filter: '',
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
          filter: '',
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
          '--text-color': 'var(--disabled-color)',
          'font-size': '16px',
          'font-weight': 'bold',
        }),
      );
    });

    it('should return styleMap with text-color when inactive and no config.styles.title', () => {
      const entity = createEntityInfo('light', 'test', 'off');
      // No config.styles.title set

      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--disabled-color)',
        }),
      );
    });

    it('should use titleColor from thresholdResult when available', () => {
      const entity = createEntityInfo('light', 'test', 'on');
      mockConfig.styles = {
        title: { 'font-size': '18px' },
      };

      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
        thresholdResult: {
          color: 'blue',
          titleColor: 'pink',
        },
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--pink-color)',
          '--state-color-text-theme': 'var(--theme-override)',
          filter: '',
          'font-size': '18px',
        }),
      );
    });

    it('should fall back to cssColor when titleColor is not specified', () => {
      const entity = createEntityInfo('light', 'test', 'on');

      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
        thresholdResult: {
          color: 'blue',
          // titleColor not specified
        },
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--primary-color)',
          '--state-color-text-theme': 'var(--theme-override)',
          filter: '',
        }),
      );
    });

    it('should use titleColor from thresholdResult when inactive', () => {
      const entity = createEntityInfo('light', 'test', 'off');
      mockConfig.styles = {
        title: { 'font-size': '16px' },
      };

      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
        thresholdResult: {
          color: 'red',
          titleColor: 'green',
        },
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--green-color)',
          'font-size': '16px',
        }),
      );
    });

    it('should include brightness filter when entity has brightness attribute', () => {
      const entity = createEntityInfo('light', 'test', 'on', {
        brightness: 100,
      });
      stateColorBrightnessStub.returns('brightness(69%)');

      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--primary-color)',
          '--state-color-text-theme': 'var(--theme-override)',
          filter: 'brightness(69%)',
        }),
      );
    });

    it('should set empty filter when entity has no brightness', () => {
      const entity = createEntityInfo('switch', 'test', 'on');
      stateColorBrightnessStub.returns('');

      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--primary-color)',
          '--state-color-text-theme': 'var(--theme-override)',
          filter: '',
        }),
      );
    });

    it('should fall back to cssColor when inactive and titleColor is not specified', () => {
      const entity = createEntityInfo('light', 'test', 'off');

      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
        thresholdResult: {
          color: 'red',
          // titleColor not specified
        },
      });

      const result = renderTextStyles(mockHass, mockConfig, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--text-color': 'var(--disabled-color)',
        }),
      );
    });
  });
});
