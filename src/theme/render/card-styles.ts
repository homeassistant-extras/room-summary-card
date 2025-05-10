import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { hasFeature } from '@config/feature';
import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config, EntityState } from '@type/config';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Generates border styles based on temperature and humidity thresholds
 *
 * @param {Config} config - Configuration object
 * @param {EntityState | undefined} tempState - Temperature sensor state
 * @param {EntityState | undefined} humidState - Humidity sensor state
 * @returns {Object} Border style configuration with border1 and border2 properties
 */
const renderCardBorderStyles = (
  config: Config,
  tempState: EntityState | undefined,
  humidState: EntityState | undefined,
): {
  border1: string | undefined;
  border2: string | undefined;
} => {
  if (hasFeature(config, 'skip_climate_styles') || !tempState || !humidState)
    return { border1: undefined, border2: undefined };

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes.temperature_threshold ?? 80;
  const humidThreshold = tempState.attributes.humidity_threshold ?? 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

  // Calculate border styles based on temperature and humidity
  let border1;
  if (temp > tempThreshold) {
    border1 = '5px solid var(--error-color)';
  } else if (humidity > humidThreshold) {
    border1 = '5px solid var(--info-color)';
  } else {
    border1 = undefined;
  }

  let border2;
  if (humidity > humidThreshold) {
    border2 = '5px solid var(--info-color)';
  } else if (temp > tempThreshold) {
    border2 = '5px solid var(--error-color)';
  } else {
    border2 = undefined;
  }

  return { border1, border2 };
};

/**
 * Generates dynamic card styles based on state and sensor readings
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - Configuration object
 * @param {EntityState | undefined} tempState - Temperature sensor state
 * @param {EntityState | undefined} humidState - Humidity sensor state
 * @param {EntityState} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective>} Style map for the card
 */
export const renderCardStyles = (
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
  const themeOverride = getThemeColorOverride(hass, state);

  const { border1, border2 } = renderCardBorderStyles(
    config,
    tempState,
    humidState,
  );

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
