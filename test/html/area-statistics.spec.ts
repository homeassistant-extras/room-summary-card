import type { HomeAssistant } from '@hass/types';
import { renderAreaStatistics } from '@html/area-statistics';
import * as stateDisplayModule from '@html/state-display';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('area-statistics.ts', () => {
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
        html`<span class="stats text">${'2 devices 2 entities'}</span>`,
      );
    });

    it('should handle areas with no devices or entities', () => {
      mockConfig.area = 'empty_area';
      const result = renderAreaStatistics(mockHass, mockConfig);
      expect(result).to.deep.equal(
        html`<span class="stats text">${'0 devices 0 entities'}</span>`,
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
        html`<span class="stats text">${'2 devices 3 entities'}</span>`,
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
        html`<span class="stats text">${'2 devices 3 entities'}</span>`,
      );
    });
  });
};
