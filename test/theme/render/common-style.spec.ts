import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import * as customThemeModule from '@theme/custom-theme';
import { getStyleData } from '@theme/render/common-style';
import * as thresholdColorModule from '@theme/threshold-color';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
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

describe('common-style.ts', () => {
  let mockHass: any;
  let sandbox: sinon.SinonSandbox;
  let stateActiveStub: sinon.SinonStub;
  let stateColorCssStub: sinon.SinonStub;
  let getThemeColorOverrideStub: sinon.SinonStub;
  let getThresholdResultStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    stateActiveStub = sandbox.stub(stateActiveModule, 'stateActive');
    stateColorCssStub = sandbox.stub(stateColorModule, 'stateColorCss');
    getThemeColorOverrideStub = sandbox.stub(
      customThemeModule,
      'getThemeColorOverride',
    );
    getThresholdResultStub = sandbox.stub(
      thresholdColorModule,
      'getThresholdResult',
    );

    // Default stub behaviors
    stateActiveStub.returns(true);
    stateColorCssStub.returns('var(--primary-color)');
    getThemeColorOverrideStub.returns('var(--theme-override)');
    getThresholdResultStub.returns(undefined);

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

  describe('getStyleData', () => {
    it('should return null when entity has no state', () => {
      const entity = {
        config: { entity_id: 'light.test' },
        state: undefined,
      };
      const result = getStyleData(mockHass, 'test', entity);
      expect(result).to.be.null;
    });

    it('should return correct style data for active and inactive states', () => {
      // Test active state
      const activeEntity = createEntityInfo('light', 'test', 'on');
      stateActiveStub.returns(true);

      let result = getStyleData(mockHass, 'test', activeEntity);
      expect(result).to.deep.equal({
        active: true,
        cssColor: 'var(--primary-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'active',
        thresholdResult: undefined,
      });

      // Test inactive state
      const inactiveEntity = createEntityInfo('light', 'test', 'off');
      stateActiveStub.returns(false);
      stateColorCssStub.returns('var(--disabled-color)');

      result = getStyleData(mockHass, 'test', inactiveEntity);
      expect(result).to.deep.equal({
        active: false,
        cssColor: 'var(--disabled-color)',
        themeOverride: 'var(--theme-override)',
        activeClass: 'inactive',
        thresholdResult: undefined,
      });
    });

    it('should use theme fallback when cssColor is undefined', () => {
      const entity = createEntityInfo('light', 'test', 'on');
      stateColorCssStub.returns(undefined);

      const result = getStyleData(mockHass, 'test', entity);

      expect(result?.cssColor).to.equal('var(--state-color-test-theme)');
      expect(result?.active).to.be.true;
      expect(result?.activeClass).to.equal('active');
    });

    it('should call underlying functions with correct parameters', () => {
      const entity = createEntityInfo('switch', 'test', 'on');

      getStyleData(mockHass, 'test', entity);

      expect(stateActiveStub.calledOnce).to.be.true;
      expect(stateColorCssStub.calledOnce).to.be.true;
      expect(getThemeColorOverrideStub.calledOnce).to.be.true;
      // getThemeColorOverride is called with (hass, entity, thresholdResult, isActive)
      // thresholdResult is undefined (from stub), isActive is true (from stateActiveStub)
      expect(
        getThemeColorOverrideStub.calledWith(
          mockHass,
          entity,
          undefined,
          true,
        ),
      ).to.be.true;
    });

    it('should return thresholdResult in style data', () => {
      const entity = createEntityInfo('sensor', 'temperature', '25');
      const mockThresholdResult = {
        color: 'orange',
        icon: 'mdi:thermometer',
      };
      getThresholdResultStub.returns(mockThresholdResult);

      const result = getStyleData(mockHass, 'primary', entity);

      expect(result).to.not.be.null;
      expect(result?.thresholdResult).to.deep.equal(mockThresholdResult);
      expect(getThresholdResultStub.calledOnce).to.be.true;
      expect(getThresholdResultStub.calledWith(entity)).to.be.true;
    });
  });
});
