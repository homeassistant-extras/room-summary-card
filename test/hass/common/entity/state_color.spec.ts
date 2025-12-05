import * as batteryColorModule from '@hass/common/entity/color/battery_color';
import * as stateActiveModule from '@hass/common/entity/state_active';
import * as stateColorModule from '@hass/common/entity/state_color';
import {
  domainStateColorProperties,
  stateColorBrightness,
  stateColorCss,
  stateColorProperties,
} from '@hass/common/entity/state_color';
import { UNAVAILABLE } from '@hass/data/entity';
import * as groupModule from '@hass/data/group';
import * as cssVariablesModule from '@hass/resources/css-variables';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('state_color.ts', () => {
  // Helper function to create state objects for testing
  const createStateObj = (
    entityId: string,
    state: string,
    attributes = {},
  ) => ({
    entity_id: entityId,
    state,
    attributes,
    last_changed: '',
    last_updated: '',
    context: { id: '', parent_id: null, user_id: null },
  });

  // Stubs
  let batteryStateColorStub: SinonStub;
  let stateActiveStub: SinonStub;
  let computeGroupDomainStub: SinonStub;
  let computeCssVariableStub: SinonStub;
  let stateColorPropertiesStub: SinonStub;
  let domainStateColorPropertiesStub: SinonStub;

  beforeEach(() => {
    batteryStateColorStub = stub(
      batteryColorModule,
      'batteryStateColorProperty',
    );
    stateActiveStub = stub(stateActiveModule, 'stateActive');
    computeGroupDomainStub = stub(groupModule, 'computeGroupDomain');
    computeCssVariableStub = stub(cssVariablesModule, 'computeCssVariable');
  });

  afterEach(() => {
    batteryStateColorStub.restore();
    stateActiveStub.restore();
    computeGroupDomainStub.restore();
    computeCssVariableStub.restore();
    if (stateColorPropertiesStub) {
      stateColorPropertiesStub.restore();
    }
    if (domainStateColorPropertiesStub) {
      domainStateColorPropertiesStub.restore();
    }
  });

  describe('stateColorCss', () => {
    it('should return unavailable color for unavailable state', () => {
      const stateObj = createStateObj('light.test', UNAVAILABLE);
      expect(stateColorCss(stateObj, 'test')).to.equal(
        'var(--state-unavailable-color)',
      );
    });

    it('should not return unavailable color when active is true even if state is unavailable', () => {
      const stateObj = createStateObj('light.test', UNAVAILABLE);
      stateColorPropertiesStub = stub(
        stateColorModule,
        'stateColorProperties',
      ).returns(['--some-color-property']);
      computeCssVariableStub.returns('var(--some-color-property)');
      // When active is true, should show active color even if entity is unavailable
      expect(stateColorCss(stateObj, 'test', true)).to.equal(
        'var(--some-color-property)',
      );
    });

    it('should respect provided state parameter over entity state', () => {
      const stateObj = createStateObj('light.test', 'on');
      // When active is false/undefined, unavailable state should return unavailable color
      expect(stateColorCss(stateObj, 'test', false, UNAVAILABLE)).to.equal(
        'var(--state-unavailable-color)',
      );
      // When active is true, unavailable state should not return unavailable color
      // (allows active state to be shown even when entity is unavailable)
      stateColorPropertiesStub = stub(
        stateColorModule,
        'stateColorProperties',
      ).returns(['--some-color-property']);
      computeCssVariableStub.returns('var(--some-color-property)');
      expect(stateColorCss(stateObj, 'test', true, UNAVAILABLE)).to.equal(
        'var(--some-color-property)',
      );
    });

    it('should use stateObj.state when state parameter is undefined', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateColorPropertiesStub = stub(
        stateColorModule,
        'stateColorProperties',
      ).returns(['--some-color-property']);
      computeCssVariableStub.returns('var(--some-color-property)');

      // When state is undefined, should use stateObj.state
      expect(stateColorCss(stateObj, 'test', true, undefined)).to.equal(
        'var(--some-color-property)',
      );
    });

    it('should return css variable for valid color properties', () => {
      const stateObj = createStateObj('light.test', 'on');
      // Use stub on the exported module
      stateColorPropertiesStub = stub(
        stateColorModule,
        'stateColorProperties',
      ).returns(['--some-color-property']);
      computeCssVariableStub.returns('var(--some-color-property)');

      expect(stateColorCss(stateObj, 'test', true)).to.equal(
        'var(--some-color-property)',
      );
      expect(computeCssVariableStub.calledWith(['--some-color-property'])).to.be
        .true;
    });

    it('should return undefined when there are no color properties', () => {
      const stateObj = createStateObj('unsupported.entity', 'state');
      stateColorPropertiesStub = stub(
        stateColorModule,
        'stateColorProperties',
      ).returns(undefined);

      expect(stateColorCss(stateObj, 'test', false)).to.be.undefined;
    });
  });

  describe('domainStateColorProperties', () => {
    it('should generate properties array starting with theme override', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateActiveStub.returns(true);

      const result = domainStateColorProperties(
        'light',
        stateObj,
        'test',
        true,
      );
      expect(result[0]).to.equal('--state-color-test-theme');
    });

    it('should include device class specific properties when available', () => {
      const stateObj = createStateObj('binary_sensor.test', 'on', {
        device_class: 'motion',
      });
      stateActiveStub.returns(true);

      const result = domainStateColorProperties(
        'binary_sensor',
        stateObj,
        'test',
        true,
      );
      expect(result).to.include('--state-binary_sensor-motion-on-color');
    });

    it('should include state-specific properties', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateActiveStub.returns(true);

      const result = domainStateColorProperties(
        'light',
        stateObj,
        'test',
        true,
      );
      expect(result).to.include('--state-light-on-color');
    });

    it('should include active/inactive properties', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateActiveStub.returns(true);

      const result = domainStateColorProperties(
        'light',
        stateObj,
        'test',
        true,
      );
      expect(result).to.include('--state-light-active-color');
      expect(result).to.include('--state-active-color');
    });

    it('should handle state slugification', () => {
      const stateObj = createStateObj('climate.test', 'heat_cool');
      stateActiveStub.returns(true);

      const result = domainStateColorProperties(
        'climate',
        stateObj,
        'test',
        true,
      );
      expect(result).to.include('--state-climate-heat_cool-color');
    });

    it('should respect provided state parameter', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateActiveStub.returns(false);

      const result = domainStateColorProperties(
        'light',
        stateObj,
        'test',
        false,
        'off',
      );
      expect(result).to.include('--state-light-off-color');
    });

    it('should use stateActive when active parameter is undefined', () => {
      const stateObj = createStateObj('light.test', 'on');
      stateActiveStub.returns(true);

      // When active is undefined, should call stateActive
      const result = domainStateColorProperties(
        'light',
        stateObj,
        'test',
        undefined,
      );
      expect(stateActiveStub.calledWith(stateObj, undefined)).to.be.true;
      expect(result).to.include('--state-light-active-color');
    });
  });

  describe('stateColorProperties', () => {
    it('should handle battery sensors specially', () => {
      const stateObj = createStateObj('sensor.battery', '75', {
        device_class: 'battery',
      });
      batteryStateColorStub.returns('--state-sensor-battery-high-color');

      const result = stateColorProperties(stateObj, 'test', true);
      expect(result).to.deep.equal([
        '--state-color-test-theme',
        '--state-sensor-battery-high-color',
      ]);
      expect(batteryStateColorStub.calledWith('75')).to.be.true;
    });

    it('should handle groups specially', () => {
      const stateObj = createStateObj('group.lights', 'on');
      computeGroupDomainStub.returns('light');

      // Create a stub for domainStateColorProperties
      domainStateColorPropertiesStub = stub(
        stateColorModule,
        'domainStateColorProperties',
      );
      domainStateColorPropertiesStub.returns(['--test-property']);

      const result = stateColorProperties(stateObj, 'test', true);
      expect(computeGroupDomainStub.calledWith(stateObj)).to.be.true;
      expect(
        domainStateColorPropertiesStub.calledWith(
          'light',
          stateObj,
          'test',
          true,
          undefined,
        ),
      ).to.be.true;
      expect(result).to.deep.equal(['--test-property']);
    });

    it('should return domain properties for supported domains', () => {
      const stateObj = createStateObj('light.test', 'on');

      // Create a stub for domainStateColorProperties
      domainStateColorPropertiesStub = stub(
        stateColorModule,
        'domainStateColorProperties',
      );
      domainStateColorPropertiesStub.returns(['--test-property']);

      const result = stateColorProperties(stateObj, 'test', false);
      expect(
        domainStateColorPropertiesStub.calledWith(
          'light',
          stateObj,
          'test',
          false,
          undefined,
        ),
      ).to.be.true;
      expect(result).to.deep.equal(['--test-property']);
    });

    it('should return undefined for unsupported domains', () => {
      const stateObj = createStateObj('input_text.test', 'value');
      const result = stateColorProperties(stateObj, 'test', false);
      expect(result).to.be.undefined;
    });

    it('should respect provided state parameter', () => {
      const stateObj = createStateObj('light.test', 'on');

      // Create a stub for domainStateColorProperties
      domainStateColorPropertiesStub = stub(
        stateColorModule,
        'domainStateColorProperties',
      );
      domainStateColorPropertiesStub.returns(['--test-property']);

      stateColorProperties(stateObj, 'test', true, 'off');
      expect(
        domainStateColorPropertiesStub.calledWith(
          'light',
          stateObj,
          'test',
          true,
          'off',
        ),
      ).to.be.true;
    });

    it('should use stateObj.state when state parameter is undefined', () => {
      const stateObj = createStateObj('light.test', 'on');

      // Create a stub for domainStateColorProperties
      domainStateColorPropertiesStub = stub(
        stateColorModule,
        'domainStateColorProperties',
      );
      domainStateColorPropertiesStub.returns(['--test-property']);

      // When state is undefined, should use stateObj.state
      stateColorProperties(stateObj, 'test', true, undefined);
      expect(
        domainStateColorPropertiesStub.calledWith(
          'light',
          stateObj,
          'test',
          true,
          undefined,
        ),
      ).to.be.true;
    });

    it('should return undefined for battery sensors when batteryStateColorProperty returns undefined', () => {
      const stateObj = createStateObj('sensor.battery', 'unknown', {
        device_class: 'battery',
      });
      batteryStateColorStub.returns(undefined);

      const result = stateColorProperties(stateObj, 'test', false);
      expect(result).to.be.undefined;
    });
  });

  describe('stateColorBrightness', () => {
    it('should return brightness filter string for entities with brightness', () => {
      const stateObj = createStateObj('light.test', 'on', {
        brightness: 100,
      });
      const result = stateColorBrightness(stateObj);
      expect(result).to.equal('brightness(69%)');
    });

    it('should calculate brightness value correctly', () => {
      // Test brightness calculation (brightness + 245) / 5
      const tests = [
        { brightness: 127, expected: '74.4%' }, // (127 + 245) / 5 = 74.4%
        { brightness: 255, expected: '100%' }, // (255 + 245) / 5 = 100%
      ];

      tests.forEach((test) => {
        const stateObj = createStateObj('light.test', 'on', {
          brightness: test.brightness,
        });
        const result = stateColorBrightness(stateObj);
        expect(result).to.equal(`brightness(${test.expected})`);
      });
    });

    it('should not apply brightness filter to plant domain', () => {
      const stateObj = createStateObj('plant.test', 'on', {
        brightness: 100,
      });
      const result = stateColorBrightness(stateObj);
      expect(result).to.equal('');
    });

    it('should return empty string for entities without brightness', () => {
      const stateObj = createStateObj('switch.test', 'on');
      const result = stateColorBrightness(stateObj);
      expect(result).to.equal('');
    });
  });
});
