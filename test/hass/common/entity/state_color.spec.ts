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

export default () => {
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
        expect(stateColorCss(stateObj)).to.equal(
          'var(--state-unavailable-color)',
        );
      });

      it('should respect provided state parameter over entity state', () => {
        const stateObj = createStateObj('light.test', 'on');
        expect(stateColorCss(stateObj, UNAVAILABLE)).to.equal(
          'var(--state-unavailable-color)',
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

        expect(stateColorCss(stateObj)).to.equal('var(--some-color-property)');
        expect(computeCssVariableStub.calledWith(['--some-color-property'])).to
          .be.true;
      });

      it('should return theme override when there are no color properties', () => {
        const stateObj = createStateObj('unsupported.entity', 'state');
        stateColorPropertiesStub = stub(
          stateColorModule,
          'stateColorProperties',
        ).returns(undefined);

        expect(stateColorCss(stateObj)).to.equal(
          'var(--state-color-theme-override)',
        );
      });
    });

    describe('domainStateColorProperties', () => {
      it('should generate properties array starting with theme override', () => {
        const stateObj = createStateObj('light.test', 'on');
        stateActiveStub.returns(true);

        const result = domainStateColorProperties('light', stateObj);
        expect(result[0]).to.equal('--state-color-theme-override');
      });

      it('should include device class specific properties when available', () => {
        const stateObj = createStateObj('binary_sensor.test', 'on', {
          device_class: 'motion',
        });
        stateActiveStub.returns(true);

        const result = domainStateColorProperties('binary_sensor', stateObj);
        expect(result).to.include('--state-binary_sensor-motion-on-color');
      });

      it('should include state-specific properties', () => {
        const stateObj = createStateObj('light.test', 'on');
        stateActiveStub.returns(true);

        const result = domainStateColorProperties('light', stateObj);
        expect(result).to.include('--state-light-on-color');
      });

      it('should include active/inactive properties', () => {
        const stateObj = createStateObj('light.test', 'on');
        stateActiveStub.returns(true);

        const result = domainStateColorProperties('light', stateObj);
        expect(result).to.include('--state-light-active-color');
        expect(result).to.include('--state-active-color');
      });

      it('should handle state slugification', () => {
        const stateObj = createStateObj('climate.test', 'heat_cool');
        stateActiveStub.returns(true);

        const result = domainStateColorProperties('climate', stateObj);
        expect(result).to.include('--state-climate-heat_cool-color');
      });

      it('should respect provided state parameter', () => {
        const stateObj = createStateObj('light.test', 'on');
        stateActiveStub.returns(false);

        const result = domainStateColorProperties('light', stateObj, 'off');
        expect(result).to.include('--state-light-off-color');
      });
    });

    describe('stateColorProperties', () => {
      it('should handle battery sensors specially', () => {
        const stateObj = createStateObj('sensor.battery', '75', {
          device_class: 'battery',
        });
        batteryStateColorStub.returns('--state-sensor-battery-high-color');

        const result = stateColorProperties(stateObj);
        expect(result).to.deep.equal([
          '--state-color-theme-override',
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

        const result = stateColorProperties(stateObj);
        expect(computeGroupDomainStub.calledWith(stateObj)).to.be.true;
        expect(
          domainStateColorPropertiesStub.calledWith(
            'light',
            stateObj,
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

        const result = stateColorProperties(stateObj);
        expect(
          domainStateColorPropertiesStub.calledWith(
            'light',
            stateObj,
            undefined,
          ),
        ).to.be.true;
        expect(result).to.deep.equal(['--test-property']);
      });

      it('should return undefined for unsupported domains', () => {
        const stateObj = createStateObj('input_text.test', 'value');
        const result = stateColorProperties(stateObj);
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

        stateColorProperties(stateObj, 'off');
        expect(
          domainStateColorPropertiesStub.calledWith('light', stateObj, 'off'),
        ).to.be.true;
      });

      it('should return undefined for battery sensors when batteryStateColorProperty returns undefined', () => {
        const stateObj = createStateObj('sensor.battery', 'unknown', {
          device_class: 'battery',
        });
        batteryStateColorStub.returns(undefined);

        const result = stateColorProperties(stateObj);
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
};
