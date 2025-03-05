/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css, nothing } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import type { Config, EntityState } from '@type/config';
import type { HomeAssistant, State } from '@type/homeassistant';
import {
  homeAssistantRgbColors,
  minimalistRgbColors,
  themeColors,
} from '@util/theme';
import { getState } from './helpers';

const HA_COLORS = [
  'primary',
  'accent',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
  'disabled',
];

const translateColorToRgb = (color: string, alpha: number = 1): string => {
  // use the primary or accent color from HA default theme
  if (color === 'primary' || color === 'accent') {
    // this will be a HA theme variable already in rgb format
    return `rgba(var(--rgb-${color}-color), ${alpha})`;
  }

  // use a supported HA theme color
  if (HA_COLORS.includes(color)) {
    return `rgba(var(--rgb-${color}), ${alpha})`;
  }

  return '';
};

/**
 * Maps Home Assistant domains to their conventional active state colors
 * Returns a color name from the standard HA_COLORS list
 *
 * @param domain - The Home Assistant domain (e.g., 'light', 'switch', 'cover')
 * @returns Color name from HA_COLORS (e.g., 'amber', 'blue')
 */
const activeColorFromDomain = (domain: string | undefined) => {
  switch (domain) {
    // Lighting
    case 'light':
    case 'switch_as_x':
      return 'amber';

    // Switches & Electric
    case 'switch':
    case 'input_boolean':
    case 'automation':
    case 'script':
      return 'blue';

    // Climate & Environment
    case 'climate':
    case 'fan':
      return 'teal';

    // Security & Safety
    case 'alarm_control_panel':
    case 'lock':
      return 'red';

    // Covers & Doors
    case 'cover':
    case 'garage_door':
    case 'door':
      return 'green';

    // Media
    case 'media_player':
      return 'indigo';

    // Sensors & Binary Sensors
    case 'binary_sensor':
    case 'sensor':
      return 'cyan';

    // Person & Presence
    case 'person':
    case 'device_tracker':
      return 'purple';

    // Weather & Update
    case 'weather':
    case 'update':
      return 'orange';

    // Vacuum
    case 'vacuum':
      return 'deep-purple';

    // Timer & Schedule
    case 'timer':
    case 'schedule':
      return 'pink';

    // Default for unknown domains
    default:
      return 'amber';
  }
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
  // Extract basic state information
  const isActive = state?.isActive;
  const onColor =
    state?.attributes?.on_color || activeColorFromDomain(state?.domain);
  const tempSensor = config!.temperature_sensor;
  const humiditySensor = config!.humidity_sensor;

  // Get sensor states
  const tempState = getState(hass, tempSensor);
  const humidState = getState(hass, humiditySensor);

  if (!tempState || !humidState) return ``;

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes.temperature_threshold || 80;
  const humidThreshold = tempState.attributes.humidity_threshold || 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

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

  // Return complete style map
  return styleMap({
    '--background-color-card': isActive
      ? translateColorToRgb(onColor, 0.1)
      : undefined,
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
  state?: EntityState,
): {
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective>;
} => {
  const isActive = state?.isActive || false;
  const onColor =
    state?.attributes?.on_color || activeColorFromDomain(state?.domain);
  const offColor = state?.attributes?.off_color;
  const iconColor = isActive ? onColor : offColor;

  return {
    // Icon color styles
    iconStyle: iconColor
      ? styleMap({
          '--icon-color': translateColorToRgb(iconColor, 1),
          '--background-color': translateColorToRgb(iconColor, 0.2),
        })
      : nothing,

    // Text color styles
    textStyle: isActive
      ? styleMap({
          '--text-color': translateColorToRgb(iconColor, 1),
        })
      : nothing,
  };
};

/**
 * Static CSS styles for the Room Summary Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
  /* Card Themes and Colors */
  :host {
    ${homeAssistantRgbColors}
    ${minimalistRgbColors}
    ${themeColors}
  }

  :host {
    --icon-color: rgba(var(--rgb-icon), 0.2);
    --text-color: var(--rgb-text);
    --background-color-card: rgba(var(--rgb-card-background), 1);
    --background-color: rgba(var(--rgb-icon-background), 0.05);
  }

  /* Card container */
  .card {
    background: var(--background-color-card);
    padding: 5px;
    border-radius: 20px;
    line-height: normal;
    overflow: hidden;
  }

  /* Grid layout */
  .grid {
    display: grid;
    grid-template-areas:
      'n n n e1'
      'l l l e2'
      'r r . e3'
      'r r . e4';
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    justify-items: center;
    aspect-ratio: 1/1;
  }

  /* Room name styling */
  .name {
    grid-area: n;
    align-self: end;
    font-size: 18px;
    margin-bottom: 10%;
    cursor: pointer;
  }

  /* Label styling */
  .label {
    grid-area: l;
    align-self: start;
    font-size: 14px;
    margin-top: -10%;
    filter: opacity(40%);
    cursor: pointer;
  }

  .label p {
    margin: 0;
  }

  /* Statistics text */
  .stats {
    font-size: 0.8em;
  }

  /* Common text styles */
  .text {
    color: var(--text-color);
    text-overflow: ellipsis;
    white-space: nowrap;
    justify-self: start;
    overflow: hidden;
    font-weight: bold;
    margin-left: 12px;
    max-width: calc(100% - 12px);
  }

  /* Room area styling */
  .room {
    grid-area: r;
    cursor: pointer;
  }

  /* Icon container styling */
  .icon {
    background-color: var(--background-color);
    height: 150%;
    width: 150%;
    align-self: center;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    --mdc-icon-size: 100%;
  }

  /* Entity styling */
  .entity {
    width: 80%;
    height: 80%;
    place-items: center;
    cursor: pointer;
  }

  /* Entity position classes */
  .entity-1 {
    grid-area: e1;
  }
  .entity-2 {
    grid-area: e2;
  }
  .entity-3 {
    grid-area: e3;
  }
  .entity-4 {
    grid-area: e4;
  }

  /* Status entities indicator */
  .status-entities {
    grid-area: 4 / 1 / 4 / 1;
    align-self: end;
    justify-self: start;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: rgb(var(--rgb-black));
  }
`;
