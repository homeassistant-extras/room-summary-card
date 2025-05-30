import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as customThemeModule from '@theme/custom-theme';
import { getStyleData } from '@theme/render/common-style';
import type { EntityState } from '@type/config';
import { expect } from 'chai';
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
  describe('common-style.ts', () => {
    let mockHass: any;
    let sandbox: sinon.SinonSandbox;
    let stateActiveStub: sinon.SinonStub;
    let stateColorCssStub: sinon.SinonStub;
    let getThemeColorOverrideStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a sinon sandbox for managing stubs
      sandbox = sinon.createSandbox();

      // Create stubs for the imported functions
      stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
      stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
      getThemeColorOverrideStub = sandbox.stub(
        customThemeModule,
        'getThemeColorOverride',
      );

      // Default behavior for stubs
      stateActiveStub.returns(true);
      stateColorCssStub.returns('var(--primary-color)');
      getThemeColorOverrideStub.returns('var(--theme-override)');

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

    describe('getStyleData', () => {
      it('should return null when state is undefined', () => {
        const result = getStyleData(mockHass);
        expect(result).to.be.null;
      });

      it('should return style data for active state', () => {
        const state = createStateEntity('light', 'test', 'on');
        stateActiveStub.returns(true);
        stateColorCssStub.returns('var(--primary-color)');
        getThemeColorOverrideStub.returns('var(--theme-override)');

        const result = getStyleData(mockHass, state);

        expect(result).to.deep.equal({
          active: true,
          cssColor: 'var(--primary-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'active',
        });
      });

      it('should return style data for inactive state', () => {
        const state = createStateEntity('light', 'test', 'off');
        stateActiveStub.returns(false);
        stateColorCssStub.returns('var(--disabled-color)');
        getThemeColorOverrideStub.returns('var(--theme-override)');

        const result = getStyleData(mockHass, state);

        expect(result).to.deep.equal({
          active: false,
          cssColor: 'var(--disabled-color)',
          themeOverride: 'var(--theme-override)',
          activeClass: 'inactive',
        });
      });

      it('should call underlying functions with correct parameters', () => {
        const state = createStateEntity('switch', 'test', 'on');

        getStyleData(mockHass, state);

        expect(stateActiveStub.calledOnce).to.be.true;
        expect(stateColorCssStub.calledOnce).to.be.true;
        expect(getThemeColorOverrideStub.calledOnce).to.be.true;
        expect(getThemeColorOverrideStub.calledWith(mockHass, state, true)).to
          .be.true;
      });

      it('should handle undefined cssColor', () => {
        const state = createStateEntity('light', 'test', 'on');
        stateColorCssStub.returns(undefined);

        const result = getStyleData(mockHass, state);

        expect(result?.cssColor).to.be.undefined;
        expect(result?.active).to.be.true;
        expect(result?.activeClass).to.equal('active');
      });
    });
  });
};
