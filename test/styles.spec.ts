import { getState } from '@/helpers';
import { createStateEntity as e } from '@test/test-helpers';
import {
  getCardStyles,
  getClimateStyles,
  getEntityIconStyles,
} from '@theme/render-styles';
import type { Config } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';
import { nothing } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';

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
        'sensor.test_temp': e('sensor', 'test_temp', '75', {
          temperature_threshold: 80,
        }),
        'sensor.test_humidity': e('sensor', 'test_humidity', '50', {
          humidity_threshold: 60,
        }),
        'light.test': e('light', 'test'),
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

      const state = e('light', 'test_light', 'on', {
        on_color: 'yellow',
      });

      const styles = getCardStyles(mockHass as HomeAssistant, config, state);
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': `rgba(var(--rgb-${state.attributes.on_color}), 0.1)`,
          borderLeft: '2px solid rgba(var(--rgb-red),1)',
          borderTop: '2px solid rgba(var(--rgb-red),1)',
          borderRight: '2px solid rgba(var(--rgb-blue),1)',
          borderBottom: '2px solid rgba(var(--rgb-blue),1)',
        }),
      );
    });

    it('should handle high temperature threshold', () => {
      mockHass.states!['sensor.test_temp']!.state = '85';

      const styles = getCardStyles(mockHass as HomeAssistant, config);
      expect(styles).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          borderLeft: '2px solid rgba(var(--rgb-red),1)',
          borderTop: '2px solid rgba(var(--rgb-red),1)',
          borderRight: '2px solid rgba(var(--rgb-red),1)',
          borderBottom: '2px solid rgba(var(--rgb-red),1)',
        }),
      );
    });

    it('should set background color to on_color when state is "on"', () => {
      mockHass.states!['light.test']!.state = 'on';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': 'rgba(var(--rgb-amber), 0.1)',
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
        }),
      );
    });

    it('should set background color to on_color when state is "true"', () => {
      mockHass.states!['light.test']!.state = 'true';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': 'rgba(var(--rgb-amber), 0.1)',
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
        }),
      );
    });

    it('should set background color to on_color when state is a positive number', () => {
      mockHass.states!['light.test']!.state = '1';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': 'rgba(var(--rgb-amber), 0.1)',
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
        }),
      );
    });

    it('should not set background color when state is "off"', () => {
      mockHass.states!['light.test']!.state = 'off';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
        }),
      );
    });

    it('should not set background color when state is "false"', () => {
      mockHass.states!['light.test']!.state = 'false';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
        }),
      );
    });

    it('should not set background color when state is a non-positive number', () => {
      mockHass.states!['light.test']!.state = '0';
      const state = getState(mockHass, 'light.test');
      const result = getCardStyles(mockHass, config, state);

      expect(result).to.deep.equal(
        styleMap({
          '--background-color-card': undefined,
          borderLeft: undefined,
          borderTop: undefined,
          borderRight: undefined,
          borderBottom: undefined,
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
      const state = e('light', 'test', 'on', { on_color: 'yellow' });

      const { iconStyle, textStyle } = getEntityIconStyles(state);

      expect(iconStyle).to.deep.equal(
        styleMap({
          '--background-color': `rgba(var(--rgb-${state.attributes.on_color}), 0.2)`,
          '--icon-color': `rgba(var(--rgb-${state.attributes.on_color}), 1)`,
        }),
      );
      expect(textStyle).to.deep.equal(
        styleMap({
          '--text-color': `rgba(var(--rgb-${state.attributes.on_color}), 1)`,
        }),
      );
    });

    it('should handle inactive state', () => {
      const state = e('light', 'test', 'off', { off_color: 'grey' });

      const { iconStyle, textStyle } = getEntityIconStyles(state);

      expect(iconStyle).to.deep.equal(
        styleMap({
          '--background-color': `rgba(var(--rgb-${state.attributes.off_color}), 0.2)`,
          '--icon-color': `rgba(var(--rgb-${state.attributes.off_color}), 1)`,
        }),
      );
      expect(textStyle).to.equal(nothing);
    });

    it('should handle bad color', () => {
      const state = e('light', 'test', 'off', { off_color: 'blurple' });

      const { iconStyle, textStyle } = getEntityIconStyles(state);

      expect(iconStyle).to.deep.equal(
        styleMap({
          '--background-color': '',
          '--icon-color': '',
        }),
      );
      expect(textStyle).to.equal(nothing);
    });
  });
});
