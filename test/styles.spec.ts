import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import { getState } from '../src/helpers';
import {
  getCardStyles,
  getClimateStyles,
  getEntityIconStyles,
} from '../src/styles';
import type { Config } from '../src/types/config';
import type { HomeAssistant } from '../src/types/homeassistant';
import { createStateEntity as s } from './helpers';

describe('styles.ts', () => {
  let mockHass: HomeAssistant;
  let config: Config;

  beforeEach(() => {
    config = {
      area: 'test_area',
      temperature_sensor: 'sensor.test_temp',
      humidity_sensor: 'sensor.test_humidity',
    };
    mockHass = {
      states: {
        'sensor.test_temp': s('sensor', 'test_temp', '75', {
          temperature_threshold: 80,
        }),
        'sensor.test_humidity': s('sensor', 'test_humidity', '50', {
          humidity_threshold: 60,
        }),
        'light.test': s('light', 'test'),
      },
      entities: {},
      devices: {},
      areas: {},
    };
  });

  describe('getCardStyles', () => {
    it('should return styles based on temperature and humidity', () => {
      mockHass.states!['sensor.test_temp']!.state = '85';
      mockHass.states!['sensor.test_humidity']!.state = '85';

      const state = s('light', 'test_light', 'on', {
        on_color: 'yellow',
      });

      const styles = getCardStyles(mockHass as HomeAssistant, config, state);
      expect(styles).to.deep.equal(
        styleMap({
          'background-color': `rgba(var(--color-background-${state.attributes.on_color}),var(--opacity-bg))`,
          borderLeft: '2px solid rgba(var(--color-red-text),1)',
          borderTop: '2px solid rgba(var(--color-red-text),1)',
          borderRight: '2px solid rgba(var(--color-blue-text),1)',
          borderBottom: '2px solid rgba(var(--color-blue-text),1)',
        }),
      );
    });

    it('should handle high temperature threshold', () => {
      mockHass.states!['sensor.test_temp']!.state = '85';

      const styles = getCardStyles(mockHass as HomeAssistant, config);
      expect(styles).to.deep.equal(
        styleMap({
          'background-color': undefined,
          borderLeft: '2px solid rgba(var(--color-red-text),1)',
          borderTop: '2px solid rgba(var(--color-red-text),1)',
          borderRight: '2px solid rgba(var(--color-red-text),1)',
          borderBottom: '2px solid rgba(var(--color-red-text),1)',
        }),
      );
    });

    it('should set background color to on_color when state is "on"', () => {
      mockHass.states!['light.test']!.state = 'on';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color':
            'rgba(var(--color-background-yellow),var(--opacity-bg))',
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });

    it('should set background color to on_color when state is "true"', () => {
      mockHass.states!['light.test']!.state = 'true';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color':
            'rgba(var(--color-background-yellow),var(--opacity-bg))',
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });

    it('should set background color to on_color when state is a positive number', () => {
      mockHass.states!['light.test']!.state = '1';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color':
            'rgba(var(--color-background-yellow),var(--opacity-bg))',
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });

    it('should not set background color when state is "off"', () => {
      mockHass.states!['light.test']!.state = 'off';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color': undefined,
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });

    it('should not set background color when state is "false"', () => {
      mockHass.states!['light.test']!.state = 'false';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color': undefined,
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });

    it('should not set background color when state is a non-positive number', () => {
      mockHass.states!['light.test']!.state = '0';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          'background-color': undefined,
          borderLeft: '',
          borderTop: '',
          borderRight: '',
          borderBottom: '',
        }),
      );
    });
  });

  describe('getClimateStyles', () => {
    it('should return valid climate styles and icons', () => {
      const { climateStyles, climateIcons } = getClimateStyles();

      expect(climateStyles.heat).to.equal('red');
      expect(climateStyles.cool).to.equal('blue');
      expect(climateIcons.heat).to.equal('mdi:fire');
      expect(climateIcons.cool).to.equal('mdi:snowflake');
    });
  });

  describe('getEntityIconStyles', () => {
    it('should style active state', () => {
      const state = s('light', 'test', 'on', { on_color: 'yellow' });

      const { iconStyle, iconContainerStyle, textStyle } =
        getEntityIconStyles(state);

      expect(iconStyle).to.deep.equal(
        styleMap({
          color: `rgba(var(--color-${state.attributes.on_color}),1)`,
        }),
      );
      expect(iconContainerStyle).to.deep.equal(
        styleMap({
          'background-color': `rgba(var(--color-${state.attributes.on_color}),0.2)`,
        }),
      );
      expect(textStyle).to.deep.equal(
        styleMap({
          color: `rgba(var(--color-${state.attributes.on_color}-text),1)`,
        }),
      );
    });

    it('should handle inactive state', () => {
      const state = s('light', 'test', 'off', { off_color: 'gray' });

      const { iconStyle, iconContainerStyle, textStyle } =
        getEntityIconStyles(state);

      expect(iconStyle).to.deep.equal(
        styleMap({
          color: `rgba(var(--color-${state.attributes.off_color}),1)`,
        }),
      );
      expect(iconContainerStyle).to.deep.equal(
        styleMap({
          'background-color': `rgba(var(--color-${state.attributes.off_color}),0.2)`,
        }),
      );
      expect(textStyle).to.be.empty;
    });
  });
});
