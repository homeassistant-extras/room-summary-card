import * as commonStyleModule from '@theme/render/common-style';
import {
  getProblemEntitiesStyle,
  renderEntityIconStyles,
} from '@theme/render/icon-styles';
import type { EntityState } from '@type/config';
import { expect } from 'chai';
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
  describe('icon-styles.ts', () => {
    let mockHass: any;
    let sandbox: sinon.SinonSandbox;
    let getStyleDataStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a sinon sandbox for managing stubs
      sandbox = sinon.createSandbox();

      // Create stubs for the imported functions
      getStyleDataStub = sandbox.stub(commonStyleModule, 'getStyleData');

      // Set up mock Home Assistant instance
      mockHass = {
        themes: {
          darkMode: false,
          theme: 'default',
        },
      };
    });

    afterEach(() => {
      // Restore the sandbox to clean up stubs
      sandbox.restore();
    });

    describe('renderEntityIconStyles', () => {
      it('should return empty style map when getStyleData returns null', () => {
        getStyleDataStub.returns(null);
        const state = createStateEntity('light', 'test', 'on');

        const result = renderEntityIconStyles(mockHass, state);

        expect(result).to.deep.equal(styleMap({}));
        expect(getStyleDataStub.calledWith(mockHass, 'icon', state)).to.be.true;
      });

      it('should return icon styles for active state', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderEntityIconStyles(mockHass, state);

        expect(result).to.deep.equal(
          styleMap({
            '--icon-color': 'var(--primary-color)',
            '--icon-opacity': 'var(--opacity-icon-active)',
            '--background-color-icon': 'var(--primary-color)',
            '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
            '--state-color-icon-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should return icon styles for inactive state', () => {
        getStyleDataStub.returns({
          active: false,
          cssColor: 'var(--disabled-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'inactive',
        });
        const state = createStateEntity('light', 'test', 'off');

        const result = renderEntityIconStyles(mockHass, state);

        expect(result).to.deep.equal(
          styleMap({
            '--icon-color': 'var(--disabled-color)',
            '--icon-opacity': 'var(--opacity-icon-inactive)',
            '--background-color-icon': 'var(--disabled-color)',
            '--background-opacity-icon': 'var(--opacity-icon-fill-inactive)',
            '--state-color-icon-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should handle undefined cssColor', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: undefined,
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderEntityIconStyles(mockHass, state);

        expect(result).to.deep.equal(
          styleMap({
            '--icon-color': undefined,
            '--icon-opacity': 'var(--opacity-icon-active)',
            '--background-color-icon': undefined,
            '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
            '--state-color-icon-theme': 'var(--theme-override)',
          }),
        );
      });

      it('should handle undefined themeOverride', () => {
        getStyleDataStub.returns({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: undefined,
          activeClass: 'active',
        });
        const state = createStateEntity('light', 'test', 'on');

        const result = renderEntityIconStyles(mockHass, state);

        expect(result).to.deep.equal(
          styleMap({
            '--icon-color': 'var(--primary-color)',
            '--icon-opacity': 'var(--opacity-icon-active)',
            '--background-color-icon': 'var(--primary-color)',
            '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
            '--state-color-icon-theme': undefined,
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

        renderEntityIconStyles(mockHass, state);

        expect(getStyleDataStub.calledWith(mockHass, 'icon', state)).to.be.true;
      });
    });

    describe('getProblemEntitiesStyle', () => {
      it('should return error style when problem exists', () => {
        const result = getProblemEntitiesStyle(true);

        expect(result).to.deep.equal(
          styleMap({
            '--background-color-icon': 'var(--error-color)',
            '--background-opacity-icon': '0.8',
          }),
        );
      });

      it('should return success style when no problem exists', () => {
        const result = getProblemEntitiesStyle(false);

        expect(result).to.deep.equal(
          styleMap({
            '--background-color-icon': 'var(--success-color)',
            '--background-opacity-icon': '0.6',
          }),
        );
      });
    });
  });
};
