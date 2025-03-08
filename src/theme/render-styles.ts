import { nothing } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HassEntity } from '@hass/types';
import type { Config, EntityState } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { getThemeColorOverride as getColorOverride } from './custom-theme';

const getTemperatureBorders = (
  tempState: EntityState | undefined,
  humidState: EntityState | undefined,
) => {
  if (!tempState || !humidState)
    return { border1: undefined, border2: undefined };

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes.temperature_threshold || 80;
  const humidThreshold = tempState.attributes.humidity_threshold || 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

  // Calculate border styles based on temperature and humidity
  const border1 =
    temp > tempThreshold
      ? '5px solid var(--error-color)'
      : humidity > humidThreshold
        ? '5px solid var(--info-color)'
        : undefined;

  const border2 =
    humidity > humidThreshold
      ? '5px solid var(--info-color)'
      : temp > tempThreshold
        ? '5px solid var(--error-color)'
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
  tempState: EntityState | undefined,
  humidState: EntityState | undefined,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> => {
  // as of now, only dark mode handles background coloring
  const stateObj = state as any as HassEntity;
  const active = hass.themes.darkMode && stateActive(stateObj);
  const cssColor = hass.themes.darkMode ? stateColorCss(stateObj) : undefined;
  const themeOverride = getColorOverride(hass, state);

  const { border1, border2 } = getTemperatureBorders(tempState, humidState);

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

export const getProblemEntitiesStyle = (problemExists: boolean) => {
  return styleMap({
    '--background-color-icon': `${
      problemExists ? 'var(--error-color)' : 'var(--success-color)'
    }`,
    '--background-opacity-icon': `${problemExists ? '0.8' : '0.6'}`,
  });
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
  const themeOverride = getColorOverride(hass, state, active);
  const activeClass = active ? 'active' : 'inactive';

  return {
    // Icon color styles
    iconStyle: styleMap({
      '--icon-color': cssColor,
      '--icon-opacity': `var(--opacity-icon-${activeClass})`,
      '--background-color-icon': cssColor,
      '--background-opacity-icon': `var(--opacity-icon-fill-${activeClass})`,
      '--state-color-theme-override': themeOverride,
    }),

    // Text color styles
    textStyle: active
      ? styleMap({
          '--text-color': cssColor,
        })
      : nothing,
  };
};
