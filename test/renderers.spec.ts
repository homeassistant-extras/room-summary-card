import {
  renderAreaStatistics,
  renderLabel,
  renderProblemIndicator,
  renderStateIcon,
} from '@/util/render';
import * as actionHandlerModule from '@common/action-handler';
import { elementUpdated, fixture } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { Config, EntityInformation, EntityState } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('render.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;

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
      states: {
        'sensor.temp': s('sensor', 'temp', '', { unit_of_measurement: '°F' }),
        'sensor.humidity': s('sensor', 'humidity', '', {
          unit_of_measurement: '%',
        }),
      },
    } as HomeAssistant;

    mockConfig = {
      area: 'living_room',
      entities: [],
      temperature_sensor: 'sensor.temp',
      humidity_sensor: 'sensor.humidity',
    };
  });

  describe('renderLabel', () => {
    describe('empty labels', () => {
      beforeEach(() => {
        mockConfig.features = ['hide_climate_label'];
      });

      it('should return empty template when mockhass is undefined', () => {
        const result = renderLabel(
          undefined as unknown as HomeAssistant,
          mockConfig,
        );
        expect(result).to.equal(nothing);
      });

      it('should return empty template when config is undefined', () => {
        const result = renderLabel(mockHass, undefined as unknown as Config);
        expect(result).to.equal(nothing);
      });

      it('should return empty template when label option is false', () => {
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.equal(nothing);
      });

      it('should handle undefined sensors', () => {
        mockConfig.temperature_sensor = 'sensor.nonexistent';
        mockConfig.humidity_sensor = 'sensor.also_nonexistent';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.equal(nothing);
      });

      it('should handle empty string states', () => {
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.equal(nothing);
      });

      it('should return nothing when hide_climate_label feature is enabled', () => {
        mockHass.states['sensor.temp']!.state = '74.8';
        mockHass.states['sensor.humidity']!.state = '53';
        mockConfig.features = ['hide_climate_label'];
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.equal(nothing);
      });
    });

    describe('valid labels', () => {
      it('should render temperature only when humidity is undefined', () => {
        mockHass.states['sensor.temp']!.state = '74.8';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'74.8°F'}</p>`);
      });

      it('should render humidity only when temperature is undefined', () => {
        mockHass.states['sensor.humidity']!.state = '53';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'53%'}</p>`);
      });

      it('should render both values with separator when both are present', () => {
        mockHass.states['sensor.temp']!.state = '74.8';
        mockHass.states['sensor.humidity']!.state = '53';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'74.8°F - 53%'}</p>`);
      });

      it('should handle missing unit_of_measurement attributes', () => {
        mockHass.states['sensor.temp'] = s('sensor', 'temp', '74.8');
        mockHass.states['sensor.humidity'] = s('sensor', 'humidity', '53');
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'74.8 - 53'}</p>`);
      });

      it('should handle non-numeric states', () => {
        mockHass.states['sensor.temp']!.state = 'unknown';
        mockHass.states['sensor.humidity']!.state = 'unavailable';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(
          html`<p>${'unknown°F - unavailable%'}</p>`,
        );
      });

      it('should handle one sensor being undefined and one valid', () => {
        mockConfig.temperature_sensor = 'sensor.nonexistent';
        mockHass.states['sensor.humidity']!.state = '53';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'53%'}</p>`);
      });

      it('should handle zero values correctly', () => {
        mockHass.states['sensor.temp']!.state = '0';
        mockHass.states['sensor.humidity']!.state = '0';
        const result = renderLabel(mockHass, mockConfig);
        expect(result).to.deep.equal(html`<p>${'0°F - 0%'}</p>`);
      });
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

  describe('renderStateIcon', () => {
    // Common test variables
    let element: HTMLElement;
    let entity: EntityInformation;
    let mockState: EntityState;
    let actionHandlerStub: sinon.SinonStub;

    beforeEach(() => {
      // Mock element
      element = document.createElement('div');

      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {}, // Mock the bind method
        handleAction: () => {}, // Add any other methods that might be called
      });

      // Mock state object
      mockState = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {
          icon: 'mdi:light',
        },
        domain: 'light',
        isActive: true,
      };

      // Mock entity information
      entity = {
        config: {
          entity_id: 'light.living_room',
          icon: 'mdi:light',
        },
        state: mockState,
      };
    });

    afterEach(() => {
      actionHandlerStub.restore();
    });

    it('should return empty template when state is not present', async () => {
      entity.state = undefined;
      const result = renderStateIcon(element, mockHass, entity, []);

      expect(result).to.equal(nothing);
    });

    it('should render icon with correct classes', async () => {
      const classes = ['test-class', 'another-class'];
      const result = renderStateIcon(element, mockHass, entity, classes);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.include('icon');
      expect(el.className).to.include('test-class');
      expect(el.className).to.include('another-class');
    });

    it('should apply correct icon styles', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      expect((el as any).style.getPropertyValue('--icon-color')).to.equal(
        'rgba(var(--rgb-amber), 1)',
      );
    });

    it('should render ha-state-icon with correct properties', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);
      const stateIcon = el.querySelector('ha-state-icon');

      expect(stateIcon).to.exist;
      expect((stateIcon as any).hass).to.equal(mockHass);
      expect((stateIcon as any).stateObj).to.equal(mockState);
      expect((stateIcon as any).icon).to.equal('mdi:light');
    });

    it('should attach action handlers', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      // Verify action handler was attached
      expect((el as any).actionHandler).to.exist;
    });

    it('should handle state changes', async () => {
      // Initial render
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      // Change state
      mockState.state = 'off';
      entity.state = mockState;

      // Update element
      await elementUpdated(el);

      const stateIcon = el.querySelector('ha-state-icon');
      expect((stateIcon as any).stateObj.state).to.equal('off');
    });

    it('should handle custom icons from config', async () => {
      entity.config.icon = 'mdi:custom-icon';
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      const stateIcon = el.querySelector('ha-state-icon');
      expect((stateIcon as any).icon).to.equal('mdi:custom-icon');
    });

    it('should handle empty classes array', async () => {
      const result = renderStateIcon(element, mockHass, entity, []);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.equal('icon');
    });
  });

  describe('renderProblemIndicator', () => {
    it('should return nothing when problemEntities array is empty', () => {
      const result = renderProblemIndicator([], true);
      expect(result).to.equal(nothing);
    });

    it('should render icon with correct number when one problem entity exists', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-1');
      expect(el.className).to.include('status-entities');
    });

    it('should render icon with correct number for multiple problem entities', async () => {
      const result = renderProblemIndicator(
        ['entity1', 'entity2', 'entity3'],
        true,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-3');
    });

    it('should use green background when problemExists is false', async () => {
      const result = renderProblemIndicator(['entity1'], false);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).style.backgroundColor).to.equal(
        'rgba(var(--rgb-green), 0.6)',
      );
    });

    it('should use red background when problemExists is true', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).style.backgroundColor).to.equal(
        'rgba(var(--rgb-red), 0.8)',
      );
    });

    // Edge cases
    it('should handle large numbers of entities correctly', async () => {
      const manyEntities = Array(10).fill('entity');
      const result = renderProblemIndicator(manyEntities, true);
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-10');
    });

    it('should handle entities with special characters', async () => {
      const result = renderProblemIndicator(
        ['entity/with/slashes', 'entity.with.dots'],
        true,
      );
      const el = await fixture(result as TemplateResult);

      expect(el).to.exist;
      expect((el as any).icon).to.equal('mdi:numeric-2');
    });

    it('should properly combine multiple CSS classes', async () => {
      const result = renderProblemIndicator(['entity1'], true);
      const el = await fixture(result as TemplateResult);

      expect(el.className).to.include('status-entities');
    });
  });
});
