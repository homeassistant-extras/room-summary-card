/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css } from 'lit';
import {
  colorsDark,
  colorsLight,
  minimalistThemeColors,
  themeColors,
} from './themes';

/**
 * Base theme and color definitions
 */
const baseThemeStyles = css`
  /* Card Themes and Colors */
  :host {
    ${minimalistThemeColors}
    ${themeColors}
    ${colorsLight}
  }

  :host([isDarkMode]) {
    ${colorsDark}
  }

  :host {
    --text-color: var(--primary-text-color);

    --background-color-card: var(--theme-background-color-card);
    --background-opacity-card: var(--opacity-background-inactive);

    --icon-color: var(--theme-color-icon);
    --background-color-icon: var(--theme-background-color-icon);
    --background-opacity-icon: var(--opacity-icon-fill-inactive);
  }
`;

/**
 * Card container and background styling
 */
const cardContainerStyles = css`
  /* Card container */
  .card {
    border-radius: var(--ha-card-border-radius, var(--border-radius, 20px));
    line-height: normal;
    overflow: hidden;
    position: relative;
    box-shadow: var(--ha-card-box-shadow, none);
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    z-index: 1;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--background-color-card);
    opacity: var(--background-opacity-card);
    border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    border-width: var(--ha-card-border-width, 1px);
    border-style: solid;
    z-index: -1;
  }
`;

/**
 * Grid layout and positioning
 */
const gridLayoutStyles = css`
  /* Grid layout */
  .grid {
    display: grid;
    grid-template-areas:
      'i i i e'
      'i i i e'
      'r r . e'
      'r r . e';
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    justify-items: center;
    aspect-ratio: 1/1;
    height: 100%;
    width: 100%;
  }

  .info {
    grid-area: i;
    cursor: pointer;
    width: 100%;
    margin: 5% 0px 0px 10%;
  }

  /* Entities Container - Flexbox with consistent spacing */
  .entities-container {
    grid-area: e;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    aspect-ratio: 0.24 / 1;
    padding: 5px 5px 5px 0;
  }

  /* Room area styling - Large square shape */
  .room {
    grid-area: r;
    cursor: pointer;
    width: 150%;
    aspect-ratio: 1 / 1;
  }
`;

/**
 * Entity and component area styles
 */
const entityAreaStyles = css`
  /* Entity styling - responsive sizing with min/max bounds */
  .entity {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  /* Statistics text */
  .stats {
    font-size: 0.8em;
    filter: opacity(40%);
  }

  /* Common text styles */
  .text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

/**
 * Icon and visual indicator styles
 */
const iconStyles = css`
  /* Icon container styling */
  .icon {
    align-self: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .icon::before {
    content: '';
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-color-icon);
    opacity: var(--background-opacity-icon);
    z-index: -1;
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    opacity: var(--icon-opacity);
    --mdc-icon-size: 100%;
  }

  /* Status entities indicator */
  .status-entities {
    grid-area: 4 / 1 / 4 / 1;
    align-self: end;
    justify-self: start;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    color: var(--black-color);
    position: relative;
    margin-left: 10%;
    margin-bottom: 10%;
  }

  .status-entities::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background-color: var(--background-color-icon);
    opacity: var(--background-opacity-icon);
    z-index: -1;
  }
`;

/**
 * Sensor and label display styles
 */
const sensorLabelStyles = css`
  /* Sensor Label area styling */
  .info.bottom .sensors {
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
  }

  .info.stacked .sensors-container {
    flex-direction: column;
  }

  /* Room name styling */
  .name {
    font-size: 18px;
    color: var(--text-color);
  }

  /* Sensors */
  .sensors {
    margin-left: -2%;
    margin-top: 2%;
  }

  .sensors:not(:has(ha-state-icon)) {
    margin-left: 0px;
  }

  .sensors-container {
    display: flex;
    flex-wrap: wrap;
    filter: opacity(40%);
  }

  .sensors-container:not(:has(ha-state-icon)) {
    column-gap: 8px;
  }
`;

/**
 * Combined styles for the Room Summary Card
 * Exports all style categories as a single CSS template
 */
export const styles = css`
  ${baseThemeStyles}
  ${cardContainerStyles}
  ${gridLayoutStyles}
  ${entityAreaStyles}
  ${iconStyles}
  ${sensorLabelStyles}
`;
