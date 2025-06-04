import type { HomeAssistant } from '@hass/types';
import { renderSensors } from '@html/sensors';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('sensors.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let stateDisplayStub: SinonStub;

    beforeEach(() => {
      mockHass = {
        entities: {
          'light.living_room': {
            area_id: 'living_room',
            device_id: 'device1',
            labels: [],
          },
          'switch.living_room': {
            area_id: 'living_room',
            device_id: 'device2',
            labels: [],
          },
          'sensor.kitchen': {
            area_id: 'kitchen',
            device_id: 'device3',
            labels: [],
          },
          'light.bedroom': {
            area_id: 'bedroom',
            device_id: 'device4',
            labels: [],
          },
        },
        devices: {
          device1: { area_id: 'living_room' },
          device2: { area_id: 'living_room' },
          device3: { area_id: 'kitchen' },
          device4: { area_id: 'bedroom' },
        },
        areas: {
          living_room: { area_id: 'Living Room', icon: '' },
          kitchen: { area_id: 'Kitchen', icon: '' },
          bedroom: { area_id: 'Bedroom', icon: '' },
        },
        states: {},
      } as any as HomeAssistant;

      mockConfig = {
        area: 'living_room',
        entities: [],
      };

      // Stub the stateDisplay function
      stateDisplayStub = stub(stateDisplayModule, 'stateDisplay');
    });

    afterEach(() => {
      stateDisplayStub.restore();
    });

    it('should return nothing when hass is undefined', () => {
      const result = renderSensors(
        undefined as unknown as HomeAssistant,
        mockConfig,
        [],
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hide_climate_label feature is enabled', () => {
      mockConfig.features = ['hide_climate_label'];
      const sensors = [
        e('sensor', 'temperature', '72', { unit_of_measurement: '°F' }),
      ];
      const result = renderSensors(mockHass, mockConfig, sensors);
      expect(result).to.equal(nothing);
    });

    it('should render sensors with state icons and state displays', async () => {
      // Create test sensors
      const sensor1 = e('sensor', 'temperature', '72', {
        unit_of_measurement: '°F',
      });
      const sensor2 = e('sensor', 'humidity', '45', {
        unit_of_measurement: '%',
      });
      const sensors = [sensor1, sensor2];

      // Configure stubs to return mock HTML templates
      stateDisplayStub
        .withArgs(mockHass, sensor1)
        .returns(html`<state-display-mock>72°F</state-display-mock>`);
      stateDisplayStub
        .withArgs(mockHass, sensor2)
        .returns(html`<state-display-mock>45%</state-display-mock>`);

      // Call the function
      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify the overall structure
      expect(result.classList.contains('sensors-container')).to.be.true;

      // Verify we have two sensor divs
      const sensorDivs = result.querySelectorAll('div > div');
      expect(sensorDivs).to.have.length(2);

      // Verify each sensor div contains both ha-state-icon and state-display
      sensorDivs.forEach((div, index) => {
        const stateIcon = div.querySelector('ha-state-icon');
        const stateDisplay = div.querySelector('state-display-mock');

        expect(stateIcon).to.exist;
        expect(stateDisplay).to.exist;

        // Verify ha-state-icon has correct properties
        expect((stateIcon as any).hass).to.equal(mockHass);
        expect((stateIcon as any).stateObj).to.equal(sensors[index]);
      });

      // Verify stateDisplay was called for each sensor
      expect(stateDisplayStub.calledTwice).to.be.true;
      expect(stateDisplayStub.firstCall.args[1]).to.equal(sensor1);
      expect(stateDisplayStub.secondCall.args[1]).to.equal(sensor2);
    });

    it('should handle empty sensors array', async () => {
      const result = await fixture(
        renderSensors(mockHass, mockConfig, []) as TemplateResult,
      );

      expect(result.classList.contains('sensors-container')).to.be.true;
      expect(result.children).to.have.length(0);
    });

    it('should handle single sensor correctly', async () => {
      const sensor = e('sensor', 'temperature', '72', {
        unit_of_measurement: '°F',
      });
      const sensors = [sensor];

      stateDisplayStub
        .withArgs(mockHass, sensor)
        .returns(html`<state-display-mock>72°F</state-display-mock>`);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify structure for single sensor
      const sensorDivs = result.querySelectorAll('div > div');
      expect(sensorDivs).to.have.length(1);

      const div = sensorDivs[0]!;
      expect(div.querySelector('ha-state-icon')).to.exist;
      expect(div.querySelector('state-display-mock')).to.exist;

      // Verify stateDisplay was called once
      expect(stateDisplayStub.calledOnce).to.be.true;
      expect(stateDisplayStub.firstCall.args[1]).to.equal(sensor);
    });

    it('should handle sensors with different attributes', async () => {
      const tempSensor = e('sensor', 'temperature', '72', {
        unit_of_measurement: '°F',
        device_class: 'temperature',
        icon: 'mdi:thermometer',
      });
      const humiditySensor = e('sensor', 'humidity', '45', {
        unit_of_measurement: '%',
        device_class: 'humidity',
        icon: 'mdi:water-percent',
      });
      const pressureSensor = e('sensor', 'pressure', '1013', {
        unit_of_measurement: 'hPa',
        device_class: 'atmospheric_pressure',
        icon: 'mdi:gauge',
      });
      const sensors = [tempSensor, humiditySensor, pressureSensor];

      // Configure stubs
      stateDisplayStub
        .withArgs(mockHass, tempSensor)
        .returns(html`<state-display-mock>72°F</state-display-mock>`);
      stateDisplayStub
        .withArgs(mockHass, humiditySensor)
        .returns(html`<state-display-mock>45%</state-display-mock>`);
      stateDisplayStub
        .withArgs(mockHass, pressureSensor)
        .returns(html`<state-display-mock>1013 hPa</state-display-mock>`);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify we have three sensor divs
      const sensorDivs = result.querySelectorAll('div > div');
      expect(sensorDivs).to.have.length(3);

      // Verify each sensor has its correct stateObj
      sensorDivs.forEach((div, index) => {
        const stateIcon = div.querySelector('ha-state-icon');
        expect((stateIcon as any).stateObj).to.equal(sensors[index]);
      });

      // Verify stateDisplay was called for each sensor
      expect(stateDisplayStub.calledThrice).to.be.true;
      expect(stateDisplayStub.getCall(0).args[1]).to.equal(tempSensor);
      expect(stateDisplayStub.getCall(1).args[1]).to.equal(humiditySensor);
      expect(stateDisplayStub.getCall(2).args[1]).to.equal(pressureSensor);
    });
  });
};
