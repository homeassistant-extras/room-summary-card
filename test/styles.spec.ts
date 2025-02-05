import { expect } from 'chai';
import { styleMap } from 'lit-html/directives/style-map.js';
import {
  getCardStyles,
  getClimateStyles,
  getEntityIconStyles,
} from '../src/styles';
import type { HomeAssistant } from '../src/types/homeassistant';

describe('styles.ts', () => {
  let mockHass: Partial<HomeAssistant>;

  beforeEach(() => {
    mockHass = {
      states: {
        'sensor.test_temp': {
          state: '75',
          attributes: {
            temperature_threshold: 80,
          },
          getDomain: () => 'sensor',
          entity_id: 'sensor.test_temp',
        },
        'sensor.test_humidity': {
          state: '55',
          attributes: {
            humidity_threshold: 60,
          },
          getDomain: () => 'sensor',
          entity_id: 'sensor.test_humidity',
        },
      },
    };
  });

  describe('getCardStyles', () => {
    it('should return styles based on temperature and humidity', () => {
      mockHass.states!['sensor.test_temp']!.state = '85';
      mockHass.states!['sensor.test_humidity']!.state = '85';

      const config = {
        area: 'test_area',
        temperature_sensor: 'sensor.test_temp',
        humidity_sensor: 'sensor.test_humidity',
      };

      const state = {
        state: 'on',
        attributes: { on_color: 'yellow' },
        getDomain: () => 'climate',
        entity_id: 'climate.test',
      };

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

      const config = {
        area: 'test_area',
        temperature_sensor: 'sensor.test_temp',
        humidity_sensor: 'sensor.test_humidity',
      };

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
      const state = {
        state: 'on',
        attributes: { on_color: 'yellow' },
        getDomain: () => 'light',
        entity_id: 'light.test',
      };

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
      const state = {
        state: 'off',
        attributes: { off_color: 'gray' },
        getDomain: () => 'light',
        entity_id: 'light.test',
      };

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
      expect(textStyle).to.be.false;
    });
  });
});
