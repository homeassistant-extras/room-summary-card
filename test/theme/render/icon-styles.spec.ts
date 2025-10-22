import * as commonStyleModule from '@theme/render/common-style';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
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

describe('icon-styles.ts', () => {
  let mockHass: any;
  let sandbox: sinon.SinonSandbox;
  let getStyleDataStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');

    mockHass = {
      themes: {
        darkMode: false,
        theme: 'default',
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('renderEntityIconStyles', () => {
    it('should return empty style map when getStyleData returns null', () => {
      getStyleDataStub.returns(null);
      const entity = createEntityInfo('light', 'test', 'on');

      const result = renderEntityIconStyles(mockHass, entity);

      expect(result).to.deep.equal(nothing);
      expect(getStyleDataStub.calledWith(mockHass, 'icon', entity)).to.be.true;
    });

    it('should return correct icon styles for active and inactive states', () => {
      const entity = createEntityInfo('light', 'test', 'on');

      // Test active state
      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });

      let result = renderEntityIconStyles(mockHass, entity);
      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--primary-color)',
          '--icon-opacity': 'var(--opacity-icon-active)',
          '--background-color-icon': 'var(--primary-color)',
          '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': undefined,
        }),
      );

      // Test inactive state
      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
      });

      result = renderEntityIconStyles(mockHass, entity);
      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--disabled-color)',
          '--icon-opacity': 'var(--opacity-icon-inactive)',
          '--background-color-icon': 'var(--disabled-color)',
          '--background-opacity-icon': 'var(--opacity-icon-fill-inactive)',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': undefined,
        }),
      );
    });

    it('should handle undefined cssColor and themeOverride', () => {
      getStyleDataStub.returns({
        active: true,
        cssColor: undefined,
        themeOverride: undefined,
        activeClass: 'active',
      });
      const entity = createEntityInfo('light', 'test', 'on');

      const result = renderEntityIconStyles(mockHass, entity);

      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': undefined,
          '--icon-opacity': 'var(--opacity-icon-active)',
          '--background-color-icon': undefined,
          '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
          '--state-color-icon-theme': undefined,
          '--background-image': undefined,
        }),
      );
    });

    it('should include background image when image parameter is provided', () => {
      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });
      const entity = createEntityInfo('light', 'test', 'on');
      const imageUrl = '/local/images/test-image.png';

      const result = renderEntityIconStyles(mockHass, entity, true, imageUrl);

      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--primary-color)',
          '--icon-opacity': 'var(--opacity-icon-active)',
          '--background-color-icon': 'var(--primary-color)',
          '--background-opacity-icon': '1',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': `url(${imageUrl})`,
        }),
      );
    });
  });
});
