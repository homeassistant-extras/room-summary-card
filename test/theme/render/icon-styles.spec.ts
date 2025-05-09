import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as customThemeModule from '@theme/custom-theme';
import {
  getProblemEntitiesStyle,
  renderEntityIconStyles,
} from '@theme/render/icon-styles';
import type { EntityState } from '@type/config';
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
  } as any as EntityState;
};

export default () => {
  describe('icon-styles.ts', () => {
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
      stateActiveStub.callsFake((stateObj: any) => {
        return (
          ['on', 'true', 'home', 'open'].includes(stateObj.state) ||
          Number(stateObj.state) > 0
        );
      });

      stateColorCssStub.callsFake((stateObj: any) => {
        if (stateActiveStub(stateObj)) {
          return stateObj.attributes.on_color || 'var(--primary-color)';
        }
        return stateObj.attributes.off_color || 'var(--disabled-color)';
      });

      getThemeColorOverrideStub.returns('var(--theme-override)');

      // Set up mock Home Assistant instance
      mockHass = {
        themes: {
          darkMode: false,
          themes: {},
        },
        selectedTheme: null,
      };
    });

    afterEach(() => {
      // Restore the sandbox to clean up stubs
      sandbox.restore();
    });

    describe('renderEntityIconStyles', () => {
      it('should return nothing when state is undefined', () => {
        const { iconStyle, textStyle } = renderEntityIconStyles(
          mockHass,
          undefined,
        );

        expect(iconStyle).to.equal(nothing);
        expect(textStyle).to.equal(nothing);
      });

      it('should style active state correctly', () => {
        const state = createStateEntity('light', 'test', 'on', {
          on_color: 'yellow',
        });
        stateActiveStub.withArgs(sinon.match.any).returns(true);
        stateColorCssStub.withArgs(sinon.match.any).returns('yellow');

        const { iconStyle, textStyle } = renderEntityIconStyles(
          mockHass,
          state,
        );

        expect(iconStyle).to.deep.equal(
          styleMap({
            '--icon-color': 'yellow',
            '--icon-opacity': 'var(--opacity-icon-active)',
            '--background-color-icon': 'yellow',
            '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );

        expect(textStyle).to.deep.equal(
          styleMap({
            '--text-color': 'yellow',
          }),
        );
      });

      it('should style inactive state correctly', () => {
        const state = createStateEntity('light', 'test', 'off', {
          off_color: 'grey',
        });
        stateActiveStub.withArgs(sinon.match.any).returns(false);
        stateColorCssStub.withArgs(sinon.match.any).returns('grey');

        const { iconStyle, textStyle } = renderEntityIconStyles(
          mockHass,
          state,
        );

        expect(iconStyle).to.deep.equal(
          styleMap({
            '--icon-color': 'grey',
            '--icon-opacity': 'var(--opacity-icon-inactive)',
            '--background-color-icon': 'grey',
            '--background-opacity-icon': 'var(--opacity-icon-fill-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );

        expect(textStyle).to.equal(nothing);
      });

      it('should handle numeric states correctly', () => {
        const statePositive = createStateEntity('sensor', 'temperature', '22', {
          on_color: 'red',
        });
        const stateZero = createStateEntity('sensor', 'humidity', '0', {
          off_color: 'blue',
        });

        // Configure stubs for positive value test
        stateActiveStub.withArgs(sinon.match.has('state', '22')).returns(true);
        stateColorCssStub
          .withArgs(sinon.match.has('state', '22'))
          .returns('red');

        // Configure stubs for zero value test
        stateActiveStub.withArgs(sinon.match.has('state', '0')).returns(false);
        stateColorCssStub
          .withArgs(sinon.match.has('state', '0'))
          .returns('blue');

        const resultPositive = renderEntityIconStyles(mockHass, statePositive);
        const resultZero = renderEntityIconStyles(mockHass, stateZero);

        // Positive number should be active
        expect(resultPositive.textStyle).to.not.equal(nothing);

        // Zero should be inactive
        expect(resultZero.textStyle).to.equal(nothing);
      });

      it('should use default colors when no color attributes are provided', () => {
        const activeState = createStateEntity('switch', 'test', 'on', {});
        const inactiveState = createStateEntity('switch', 'test', 'off', {});

        // Configure stubs for active state
        stateActiveStub.withArgs(sinon.match.has('state', 'on')).returns(true);
        stateColorCssStub
          .withArgs(sinon.match.has('state', 'on'))
          .returns('var(--primary-color)');

        // Configure stubs for inactive state
        stateActiveStub
          .withArgs(sinon.match.has('state', 'off'))
          .returns(false);
        stateColorCssStub
          .withArgs(sinon.match.has('state', 'off'))
          .returns('var(--disabled-color)');

        const activeResult = renderEntityIconStyles(mockHass, activeState);
        const inactiveResult = renderEntityIconStyles(mockHass, inactiveState);

        expect(activeResult.iconStyle).to.deep.equal(
          styleMap({
            '--icon-color': 'var(--primary-color)',
            '--icon-opacity': 'var(--opacity-icon-active)',
            '--background-color-icon': 'var(--primary-color)',
            '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );

        expect(inactiveResult.iconStyle).to.deep.equal(
          styleMap({
            '--icon-color': 'var(--disabled-color)',
            '--icon-opacity': 'var(--opacity-icon-inactive)',
            '--background-color-icon': 'var(--disabled-color)',
            '--background-opacity-icon': 'var(--opacity-icon-fill-inactive)',
            '--state-color-theme-override': 'var(--theme-override)',
          }),
        );
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
