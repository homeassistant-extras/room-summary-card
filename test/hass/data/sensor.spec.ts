import * as sensorUtilsModule from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import { renderSensors } from '@html/sensors';
import { fixture } from '@open-wc/testing-helpers';
import type { Config, SensorData } from '@type/config';
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
        },
        devices: {
          device1: { area_id: 'living_room' },
        },
        areas: {
          living_room: { area_id: 'Living Room', icon: '' },
        },
        states: {},
        formatEntityState: (entity: any) =>
          `${entity.state}${entity.attributes?.unit_of_measurement || ''}`,
      } as any as HomeAssistant;

      mockConfig = {
        area: 'living_room',
        entities: [],
      };

      // Stub the sensor utils function
      sensorDataToDisplaySensorsStub = stub(
        sensorUtilsModule,
        'sensorDataToDisplaySensors',
      );
    });

    afterEach(() => {
      sensorDataToDisplaySensorsStub.restore();
    });

    it('should return nothing when hass is undefined', () => {
      const result = renderSensors(
        undefined as unknown as HomeAssistant,
        mockConfig,
        {} as SensorData,
      );
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hide_climate_label feature is enabled', () => {
      mockConfig.features = ['hide_climate_label'];
      const sensorData = {} as SensorData;
      const result = renderSensors(mockHass, mockConfig, sensorData);
      expect(result).to.equal(nothing);
    });

    it('should render sensors with domain icons and formatted states', async () => {
      // Mock display sensors
      const mockDisplaySensors = [
        {
          domain: 'sensor',
          device_class: 'temperature',
          value: '72°F',
          is_averaged: false,
          state: {
            entity_id: 'sensor.temperature',
            state: '72',
            attributes: {
              unit_of_measurement: '°F',
              device_class: 'temperature',
            },
          },
        },
        {
          domain: 'sensor',
          device_class: 'humidity',
          value: '45%',
          is_averaged: false,
          state: {
            entity_id: 'sensor.humidity',
            state: '45',
            attributes: { unit_of_measurement: '%', device_class: 'humidity' },
          },
        },
      ];

      sensorDataToDisplaySensorsStub.returns(mockDisplaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
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

        // Verify ha-domain-icon has correct properties
        expect((domainIcon as any).hass).to.equal(mockHass);
        expect((domainIcon as any).domain).to.equal('sensor');
        expect((domainIcon as any).deviceClass).to.equal(
          mockDisplaySensors[index]!.device_class,
        );
      });

      // Verify sensorDataToDisplaySensors was called
      expect(sensorDataToDisplaySensorsStub.calledOnce).to.be.true;
    });

    it('should handle empty sensor data', async () => {
      sensorDataToDisplaySensorsStub.returns([]);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
      );

      expect(result.classList.contains('sensors-container')).to.be.true;
      expect(result.children).to.have.length(0);
    });

    it('should hide icons when hide_sensor_icons feature is enabled', async () => {
      mockConfig.features = ['hide_sensor_icons'];

      const mockDisplaySensors = [
        {
          domain: 'sensor',
          device_class: 'temperature',
          value: '72°F',
          is_averaged: false,
          state: {
            entity_id: 'sensor.temperature',
            state: '72',
            attributes: { unit_of_measurement: '°F' },
          },
        },
      ];

      sensorDataToDisplaySensorsStub.returns(mockDisplaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
      );

      const sensorDiv = result.querySelector('.sensor');
      expect(sensorDiv).to.exist;

      // Should not have domain icon when icons are hidden
      const domainIcon = sensorDiv!.querySelector('ha-domain-icon');
      expect(domainIcon).to.not.exist;
    });

    it('should handle averaged sensors correctly', async () => {
      const mockDisplaySensors = [
        {
          domain: 'sensor',
          device_class: 'temperature',
          value: '72.5°F (avg)',
          is_averaged: true,
          state: null, // Averaged sensors don't have individual states
        },
      ];

      sensorDataToDisplaySensorsStub.returns(mockDisplaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
      );

      const sensorDiv = result.querySelector('.sensor');
      expect(sensorDiv).to.exist;
      expect(sensorDiv!.textContent).to.include('72.5°F (avg)');
    });

    it('should use formatEntityState for non-averaged sensors', async () => {
      const mockEntity = {
        entity_id: 'sensor.temperature',
        state: '72',
        attributes: { unit_of_measurement: '°F' },
      };

      const mockDisplaySensors = [
        {
          domain: 'sensor',
          device_class: 'temperature',
          value: '72°F',
          is_averaged: false,
          state: mockEntity,
        },
      ];

      sensorDataToDisplaySensorsStub.returns(mockDisplaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
      );

      const sensorDiv = result.querySelector('.sensor');
      expect(sensorDiv).to.exist;

      // Should use formatEntityState result for non-averaged sensors
      expect(sensorDiv!.textContent).to.include('72°F');
    });

    it('should handle mixed averaged and non-averaged sensors', async () => {
      const mockDisplaySensors = [
        {
          domain: 'sensor',
          device_class: 'temperature',
          value: '72.5°F (avg)',
          is_averaged: true,
          state: null,
        },
        {
          domain: 'sensor',
          device_class: 'humidity',
          value: '45%',
          is_averaged: false,
          state: {
            entity_id: 'sensor.humidity',
            state: '45',
            attributes: { unit_of_measurement: '%' },
          },
        },
      ];

      sensorDataToDisplaySensorsStub.returns(mockDisplaySensors);

      const result = await fixture(
        renderSensors(mockHass, mockConfig, {} as SensorData) as TemplateResult,
      );

      const sensorDivs = result.querySelectorAll('.sensor');
      expect(sensorDivs).to.have.length(2);

      // First should be averaged (direct value)
      expect(sensorDivs[0]!.textContent).to.include('72.5°F (avg)');

      // Second should use formatEntityState
      expect(sensorDivs[1]!.textContent).to.include('45%');
    });
  });
};
