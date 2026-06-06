import * as stateColorModule from '@homeassistant-extras/hass/common/entity/state_color';
import { createStateEntity as s } from '@test/test-helpers';
import * as commonStyleModule from '@theme/render/common-style';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
import { nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import * as sinon from 'sinon';

// Helper to create entity information for testing
const createEntityInfo = (
  domain: string,
  entityId: string,
  state = 'off',
  attributes = {},
): EntityInformation => ({
  config: { entity_id: `${domain}.${entityId}` },
  state: s(domain, entityId, state, {
    friendly_name: entityId.replace(/_/g, ' '),
    ...attributes,
  }),
});

describe('icon-styles.ts', () => {
  let mockHass: any;
  let sandbox: sinon.SinonSandbox;
  let getStyleDataStub: sinon.SinonStub;
  let stateColorBrightnessStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');
    stateColorBrightnessStub = sandbox.stub(
      stateColorModule,
      'stateColorBrightness',
    );

    // Default stub behavior
    stateColorBrightnessStub.returns('');

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
          '--icon-filter': '',
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
          '--icon-filter': '',
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
          '--icon-filter': '',
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
          '--icon-filter': '',
        }),
      );
    });

    it('should include brightness filter when entity has brightness attribute', () => {
      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });
      const entity = createEntityInfo('light', 'test', 'on', {
        brightness: 100,
      });
      stateColorBrightnessStub.returns('brightness(69%)');

      const result = renderEntityIconStyles(mockHass, entity);

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--primary-color)',
          '--icon-opacity': 'var(--opacity-icon-active)',
          '--background-color-icon': 'var(--primary-color)',
          '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': undefined,
          '--icon-filter': 'brightness(69%)',
        }),
      );
    });

    it('should set empty icon filter when entity has no brightness', () => {
      getStyleDataStub.returns({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
      });
      const entity = createEntityInfo('switch', 'test', 'on');
      stateColorBrightnessStub.returns('');

      const result = renderEntityIconStyles(mockHass, entity);

      expect(stateColorBrightnessStub.calledWith(entity.state)).to.be.true;
      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--primary-color)',
          '--icon-opacity': 'var(--opacity-icon-active)',
          '--background-color-icon': 'var(--primary-color)',
          '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': undefined,
          '--icon-filter': '',
        }),
      );
    });

    it('should use inactive default opacity when entity is inactive and no image is present', () => {
      // Config-driven user opacity is now routed by CSS, not by this function.
      // The function always emits the default fill var or '1' (when image+active).
      getStyleDataStub.returns({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
      });
      const entity = createEntityInfo('light', 'test', 'off');

      const result = renderEntityIconStyles(mockHass, entity, true, undefined);

      expect(result).to.deep.equal(
        styleMap({
          '--icon-color': 'var(--disabled-color)',
          '--icon-opacity': 'var(--opacity-icon-inactive)',
          '--background-color-icon': 'var(--disabled-color)',
          '--background-opacity-icon': 'var(--opacity-icon-fill-inactive)',
          '--state-color-icon-theme': 'var(--theme-override)',
          '--background-image': undefined,
          '--icon-filter': '',
        }),
      );
    });
  });
});
