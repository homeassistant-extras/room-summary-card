import { expect } from 'chai';
import { html, nothing } from 'lit';
import { renderLabel } from '../src/render';
import type { Config } from '../src/types/config';
import type { HomeAssistant } from '../src/types/homeassistant';
import { createStateEntity as s } from './test-helpers';

describe('render.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {
        'sensor.temp': s('sensor', 'temp', '', { unit_of_measurement: '°F' }),
        'sensor.humidity': s('sensor', 'humidity', '', {
          unit_of_measurement: '%',
        }),
      },
    } as HomeAssistant;

    mockConfig = {
      area: 'Living Room',
      entities: [],
      temperature_sensor: 'sensor.temp',
      humidity_sensor: 'sensor.humidity',
    };
  });

  describe('empty labels', () => {
    beforeEach(() => {
      mockConfig.features = ['hide_climate_label'];
    });

    it('should return empty template when hass is undefined', () => {
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
      expect(result).to.deep.equal(html`<p>${'unknown°F - unavailable%'}</p>`);
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
