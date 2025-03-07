import { nothing } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { getState } from '@/helpers';
import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HassEntity } from '@hass/types';
import type { Config, EntityState } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { getThemeColorOverride } from './custom-theme';

const getTemperatureBorders = (hass: HomeAssistant, config: Config) => {
  const tempState = getState(hass, config!.temperature_sensor);
  const humidState = getState(hass, config!.humidity_sensor);

  if (!tempState || !humidState)
    return { border1: undefined, border2: undefined };

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes.temperature_threshold || 80;
  const humidThreshold = tempState.attributes.humidity_threshold || 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

  // todo - these colors don't work now
  // Calculate border styles based on temperature and humidity
  const border1 =
    temp > tempThreshold
      ? '2px solid rgba(var(--rgb-red),1)'
      : humidity > humidThreshold
        ? '2px solid rgba(var(--rgb-blue),1)'
        : undefined;

  const border2 =
    humidity > humidThreshold
      ? '2px solid rgba(var(--rgb-blue),1)'
      : temp > tempThreshold
        ? '2px solid rgba(var(--rgb-red),1)'
        : undefined;

  return { border1, border2 };
};

/**
 * Generates dynamic card styles based on state and sensor readings
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - Card configuration
 * @param {State} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective>} Style map for the card
 */
export const getCardStyles = (
  hass: HomeAssistant,
  config: Config,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> => {
  // as of now, only dark mode handles background coloring
  const stateObj = state as any as HassEntity;
  const active = hass.themes.darkMode && stateActive(stateObj);
  const cssColor = hass.themes.darkMode ? stateColorCss(stateObj) : undefined;
  const themeOverride = getThemeColorOverride(hass, state);

  const { border1, border2 } = getTemperatureBorders(hass, config);

  // Return complete style map
  return styleMap({
    '--background-color-card': active ? cssColor : undefined,
    '--background-opacity-card': `var(--opacity-background-${active ? 'active' : 'inactive'})`,
    '--state-color-theme-override': themeOverride,
    borderLeft: border1,
    borderTop: border1,
    borderRight: border2,
    borderBottom: border2,
  });
};

/**
 * Provides climate-specific styles and icons
 *
 * @returns {Object} Object containing style and icon mappings for climate states
 */
export const getClimateStyles = (): {
  climateStyles: Record<string, string>;
  climateIcons: Record<string, string>;
} => {
  return {
    climateStyles: {
      auto: 'green',
      cool: 'blue',
      heat: 'red',
      dry: 'yellow',
      heat_cool: 'purple',
      fan_only: 'green',
      off: 'grey',
    },
    climateIcons: {
      auto: 'mdi:autorenew',
      cool: 'mdi:snowflake',
      heat: 'mdi:fire',
      dry: 'mdi:water',
      heat_cool: 'mdi:sun-snowflake',
      fan_only: 'mdi:fan',
      off: 'mdi:snowflake-off',
    },
  };
};

/**
 * Generates styles for entity icons based on their state
 *
 * @param {State} [state] - Current entity state
 * @returns {Object} Style maps for icon, container, and text
 */
export const getEntityIconStyles = (
  hass: HomeAssistant,
  state?: EntityState,
): {
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective>;
} => {
  if (!state) return { iconStyle: nothing, textStyle: nothing };

  const stateObj = state as any as HassEntity;
  const active = stateActive(stateObj);
  const cssColor = stateColorCss(stateObj);
  const themeOverride = getThemeColorOverride(hass, state);

  // const onColor = state?.attributes?.on_color; // || activeColorFromDomain(state?.domain);
  // const offColor = state?.attributes?.off_color;
  // const iconColor = isActive ? onColor : offColor;

  return {
    // Icon color styles
    iconStyle: active
      ? styleMap({
          '--icon-color': cssColor,
          '--icon-opacity': '1',
          '--background-color-icon': cssColor,
          '--background-opacity-icon': 'var(--opacity-icon-fill-active)',
        })
      : nothing,

    // Text color styles
    textStyle: active
      ? styleMap({
          '--text-color': cssColor,
        })
      : nothing,
  };
};
