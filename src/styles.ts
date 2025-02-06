/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { getState } from './helpers';
import type { Config } from './types/config';
import type { HomeAssistant, State } from './types/homeassistant';

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
  state?: State,
): DirectiveResult<typeof StyleMapDirective> => {
  // Extract basic state information
  const isActive = state?.isActive();
  const onColor = state?.attributes?.on_color || 'yellow';
  const tempSensor = config!.temperature_sensor;
  const humiditySensor = config!.humidity_sensor;

  // Get sensor states
  const tempState = getState(hass, tempSensor);
  const humidState = getState(hass, humiditySensor);

  if (!tempState || !humidState) return ``;

  // Get thresholds with defaults
  const tempThreshold = tempState.attributes?.temperature_threshold || 80;
  const humidThreshold = tempState.attributes?.humidity_threshold || 60;

  // Parse current values
  const temp = Number(tempState.state);
  const humidity = Number(humidState.state);

  // Calculate border styles based on temperature and humidity
  const border1 =
    temp > tempThreshold
      ? '2px solid rgba(var(--color-red-text),1)'
      : humidity > humidThreshold
        ? '2px solid rgba(var(--color-blue-text),1)'
        : '';

  const border2 =
    humidity > humidThreshold
      ? '2px solid rgba(var(--color-blue-text),1)'
      : temp > tempThreshold
        ? '2px solid rgba(var(--color-red-text),1)'
        : '';

  // Return complete style map
  return styleMap({
    'background-color': isActive
      ? `rgba(var(--color-background-${onColor}),var(--opacity-bg))`
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
  state?: State,
): {
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  iconContainerStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective>;
} => {
  // on state?
  const isActive = state?.isActive();
  const onColor = state?.attributes?.on_color || 'yellow';
  const offColor = state?.attributes?.off_color;

  return {
    // Icon color styles
    iconStyle: isActive
      ? styleMap({
          color: `rgba(var(--color-${onColor}),1)`,
        })
      : offColor &&
        styleMap({
          color: `rgba(var(--color-${offColor}),1)`,
        }),

    // Icon container background styles
    iconContainerStyle: isActive
      ? styleMap({
          'background-color': `rgba(var(--color-${onColor}),0.2)`,
        })
      : offColor &&
        styleMap({
          'background-color': `rgba(var(--color-${offColor}),0.2)`,
        }),

    // Text color styles
    textStyle: isActive
      ? styleMap({
          color: `rgba(var(--color-${onColor}-text),1)`,
        })
      : '',
  };
};

/**
 * Static CSS styles for the Room Summary Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
  /* Card container */
  .card {
    padding: 5px;
    border-radius: 20px;
    box-shadow: var(--box-shadow);
    background: var(--ha-card-background, var(--card-background-color, white));
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

  /* Statistics text */
  .stats {
    font-size: 0.8em;
  }

  /* Common text styles */
  .text {
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
    background-color: rgba(var(--color-theme), 0.05);
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
    color: rgba(var(--color-theme), 0.2);
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
    border: 2px solid var(--card-background-color);
    display: grid;
    place-items: center;
    color: var(--card-background-color);
  }
`;
