import * as sensorUtilsModule from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import { renderSensors } from '@html/sensors';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config, DisplaySensor, SensorData } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('sensors.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let sensorDataToDisplaySensorsStub: SinonStub;

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
        formatEntityState: (entity: any) =>
          `${entity.state}${entity.attributes?.unit_of_measurement || ''}`,
      } as any as HomeAssistant;

      mockConfig = {
        area: 'living_room',
        entities: [],
      };

      // Stub the sensorDataToDisplaySensors function
      sensorDataToDisplaySensorsStub = stub(
        sensorUtilsModule,
        'sensorDataToDisplaySensors',
      );
    });

    afterEach(() => {
      sensorDataToDisplaySensorsStub.restore();
    });

    it('should return nothing when hass is undefined', () => {
      const sensors: SensorData = { individual: [], averaged: [] };
      const result = renderSensors(
        undefined as unknown as HomeAssistant,
        mockConfig,
        sensors,
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hide_climate_label feature is enabled', () => {
      mockConfig.features = ['hide_climate_label'];
      const sensors: SensorData = {
        individual: [
          e('sensor', 'temperature', '72', { unit_of_measurement: '°F' }),
        ],
        averaged: [],
      };
      const result = renderSensors(mockHass, mockConfig, sensors);
      expect(result).to.equal(nothing);
    });

    it('should render individual sensors with icons and formatted states', async () => {
      const sensor1 = e('sensor', 'temperature', '72', {
        unit_of_measurement: '°F',
        device_class: 'temperature',
      });
      const sensor2 = e('sensor', 'humidity', '45', {
        unit_of_measurement: '%',
        device_class: 'humidity',
      });

      const sensors: SensorData = {
        individual: [sensor1, sensor2],
        averaged: [],
      };

      const displaySensors: DisplaySensor[] = [
        {
          state: sensor1,
          domain: 'sensor',
          device_class: 'temperature',
        },
        {
          state: sensor2,
          domain: 'sensor',
          device_class: 'humidity',
        },
      ];

      sensorDataToDisplaySensorsStub.returns(displaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify the overall structure
      expect(result.classList.contains('sensors-container')).to.be.true;

      // Verify we have two sensor divs
      const sensorDivs = result.querySelectorAll('.sensor');
      expect(sensorDivs).to.have.length(2);

      // Verify each sensor div contains ha-domain-icon
      sensorDivs.forEach((div, index) => {
        const domainIcon = div.querySelector('ha-domain-icon');
        expect(domainIcon).to.exist;
        expect((domainIcon as any).hass).to.equal(mockHass);
        expect((domainIcon as any).domain).to.equal('sensor');
        expect((domainIcon as any).deviceClass).to.equal(
          displaySensors[index]!.device_class,
        );
      });

      // Verify sensorDataToDisplaySensors was called with correct parameters
      expect(sensorDataToDisplaySensorsStub.calledOnce).to.be.true;
      expect(sensorDataToDisplaySensorsStub.calledWith(sensors)).to.be.true;
    });

    it('should render averaged sensors with values', async () => {
      const sensors: SensorData = {
        individual: [],
        averaged: [
          {
            states: [e('sensor', 'temp1', '20'), e('sensor', 'temp2', '24')],
            uom: '°C',
            average: 22,
            device_class: 'temperature',
            domain: 'sensor',
          },
        ],
      };

      const displaySensors: DisplaySensor[] = [
        {
          value: '22°C',
          domain: 'sensor',
          device_class: 'temperature',
        },
      ];

      sensorDataToDisplaySensorsStub.returns(displaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify the overall structure
      expect(result.classList.contains('sensors-container')).to.be.true;

      // Verify we have one sensor div
      const sensorDivs = result.querySelectorAll('.sensor');
      expect(sensorDivs).to.have.length(1);

      // Verify the averaged sensor shows the value directly
      const sensorDiv = sensorDivs[0]!;
      expect(sensorDiv.textContent?.trim()).to.include('22°C');
    });

    it('should handle empty sensor data', async () => {
      const sensors: SensorData = { individual: [], averaged: [] };
      sensorDataToDisplaySensorsStub.returns([]);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      expect(result.classList.contains('sensors-container')).to.be.true;
      expect(result.children).to.have.length(0);
    });

    it('should hide icons when hide_sensor_icons feature is enabled', async () => {
      mockConfig.features = ['hide_sensor_icons'];

      const sensors: SensorData = {
        individual: [
          e('sensor', 'temperature', '72', {
            unit_of_measurement: '°F',
            device_class: 'temperature',
          }),
        ],
        averaged: [],
      };

      const displaySensors: DisplaySensor[] = [
        {
          state: sensors.individual[0],
          domain: 'sensor',
          device_class: 'temperature',
        },
      ];

      sensorDataToDisplaySensorsStub.returns(displaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify no icons are rendered
      const domainIcons = result.querySelectorAll('ha-domain-icon');
      expect(domainIcons).to.have.length(0);

      // But sensor content should still be there
      const sensorDivs = result.querySelectorAll('.sensor');
      expect(sensorDivs).to.have.length(1);
    });

    it('should handle mixed individual and averaged sensors', async () => {
      const individualSensor = e('sensor', 'pressure', '1013', {
        unit_of_measurement: 'hPa',
        device_class: 'pressure',
      });

      const sensors: SensorData = {
        individual: [individualSensor],
        averaged: [
          {
            states: [e('sensor', 'temp1', '20'), e('sensor', 'temp2', '24')],
            uom: '°C',
            average: 22,
            device_class: 'temperature',
            domain: 'sensor',
          },
        ],
      };

      const displaySensors: DisplaySensor[] = [
        {
          state: individualSensor,
          domain: 'sensor',
          device_class: 'pressure',
        },
        {
          value: '22°C',
          domain: 'sensor',
          device_class: 'temperature',
        },
      ];

      sensorDataToDisplaySensorsStub.returns(displaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      // Verify we have two sensor divs
      const sensorDivs = result.querySelectorAll('.sensor');
      expect(sensorDivs).to.have.length(2);

      // First should be individual sensor (formatted by hass)
      expect(sensorDivs[0]!.textContent?.trim()).to.include('1013hPa');

      // Second should be averaged sensor (direct value)
      expect(sensorDivs[1]!.textContent?.trim()).to.include('22°C');
    });

    it('should call formatEntityState for individual sensors', async () => {
      const formatEntityStateSpy = stub(mockHass, 'formatEntityState').returns(
        '72°F formatted',
      );

      const sensor = e('sensor', 'temperature', '72', {
        unit_of_measurement: '°F',
        device_class: 'temperature',
      });

      const sensors: SensorData = {
        individual: [sensor],
        averaged: [],
      };

      const displaySensors: DisplaySensor[] = [
        {
          state: sensor,
          domain: 'sensor',
          device_class: 'temperature',
        },
      ];

      sensorDataToDisplaySensorsStub.returns(displaySensors);

      await fixture(
        renderSensors(mockHass, mockConfig, sensors) as TemplateResult,
      );

      expect(formatEntityStateSpy.calledOnce).to.be.true;
      expect(formatEntityStateSpy.calledWith(sensor)).to.be.true;

      formatEntityStateSpy.restore();
    });
  });
};
