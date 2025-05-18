import type { HomeAssistant } from '@hass/types';
import * as stateDisplayModule from '@html/state-display';
import { renderAreaStatistics, renderLabel } from '@html/text';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('text.ts', () => {
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

    describe('renderLabel', () => {
      it('should return nothing when hass is undefined', () => {
        const result = renderLabel(
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
        const result = renderLabel(mockHass, mockConfig, sensors);
        expect(result).to.equal(nothing);
      });

      it('should iterate over sensors and return stateDisplay results', async () => {
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
          .returns(html`<div>72°F</div>`);
        stateDisplayStub
          .withArgs(mockHass, sensor2)
          .returns(html`<div>45%</div>`);

        // Call the function
        const result = await fixture(
          renderLabel(mockHass, mockConfig, sensors) as TemplateResult,
        );

        // Verify the result
        expect(result.innerHTML).to.contain('<div>72°F</div>');
        expect(result.innerHTML).to.contain('<div>45%</div>');

        // Verify stateDisplay was called for each sensor
        expect(stateDisplayStub.calledTwice).to.be.true;
        expect(stateDisplayStub.firstCall.args[1]).to.equal(sensor1);
        expect(stateDisplayStub.secondCall.args[1]).to.equal(sensor2);
      });

      it('should handle empty sensors array', () => {
        const result = renderLabel(mockHass, mockConfig, []);
        expect(result).to.deep.equal(
          html`<div class="sensors-container">${[]}</div>`,
        );
      });
    });

    describe('renderAreaStatistics', () => {
      it('should return nothing when mockhass is undefined', () => {
        const result = renderAreaStatistics(
          undefined as unknown as HomeAssistant,
          mockConfig,
        );
        expect(result).to.equal(nothing);
      });

      it('should return nothing when config is undefined', () => {
        const result = renderAreaStatistics(
          mockHass,
          undefined as unknown as Config,
        );
        expect(result).to.equal(nothing);
      });

      it('should return nothing when hide_area_stats feature is enabled', () => {
        mockConfig.features = ['hide_area_stats'];
        const result = renderAreaStatistics(mockHass, mockConfig);
        expect(result).to.equal(nothing);
      });

      it('should count devices and entities in the specified area', () => {
        const result = renderAreaStatistics(mockHass, mockConfig);
        expect(result).to.deep.equal(
          html`<span class="stats">${'2 devices 2 entities'}</span>`,
        );
      });

      it('should handle areas with no devices or entities', () => {
        mockConfig.area = 'empty_area';
        const result = renderAreaStatistics(mockHass, mockConfig);
        expect(result).to.deep.equal(
          html`<span class="stats">${'0 devices 0 entities'}</span>`,
        );
      });

      it('should count entities that belong to devices in the area', () => {
        // Add an entity that belongs to a device in the living room but has no direct area_id
        mockHass.entities['sensor.living_room_device'] = {
          area_id: '',
          device_id: 'device1',
          labels: [],
        };
        const result = renderAreaStatistics(mockHass, mockConfig);
        expect(result).to.deep.equal(
          html`<span class="stats">${'2 devices 3 entities'}</span>`,
        );
      });

      it('should handle entities with no device_id', () => {
        mockHass.entities['light.no_device'] = {
          area_id: 'living_room',
          device_id: '',
          labels: [],
        };
        const result = renderAreaStatistics(mockHass, mockConfig);
        expect(result).to.deep.equal(
          html`<span class="stats">${'2 devices 3 entities'}</span>`,
        );
      });
    });
  });
};
