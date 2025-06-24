/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css } from 'lit';
import { occupancyStyles } from './css/occupancy';
import {
  colorsDark,
  colorsLight,
  minimalistThemeColors,
  themeColors,
} from './themes';

/**
 * Base theme and color definitions
 */
const hostThemeStyles = css`
  /* Card Themes and Colors */
  :host {
    ${minimalistThemeColors}
    ${themeColors}
    ${colorsLight}
  }

  :host([dark]) {
    ${colorsDark}
  }

  :host {
    --text-color: var(--primary-text-color);
    --background-color-card: var(--theme-background-color-card);
    --background-opacity-card: var(--opacity-background-inactive);
    --icon-color: var(--theme-color-icon);
    --background-color-icon: var(--theme-background-color-icon);
    --background-opacity-icon: var(--opacity-icon-fill-inactive);
    --background-image: none;
  }
`;

/**
 * Base theme and color definitions
 */
const haCardThemeStyles = css`
  :host([hot]) ha-card {
    border-left: 3px solid var(--error-color) !important;
    border-top: 3px solid var(--error-color) !important;
    border-right: 3px solid var(--error-color);
    border-bottom: 3px solid var(--error-color);
  }

  :host([humid]) ha-card {
    border-left: 3px solid var(--info-color);
    border-top: 3px solid var(--info-color);
    border-right: 3px solid var(--info-color) !important;
    border-bottom: 3px solid var(--info-color) !important;
  }

  :host([image]) ha-card {
    --opacity-theme: 0.3;
    --text-opacity-theme: 0.8;
    --opacity-icon-fill-inactive: 0.2;
  }
`;

/**
 * Card container and background styling
 */
const cardContainerStyles = css`
  ha-card {
    line-height: normal;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  :host([image]) ha-card::before {
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.8),
        rgba(0, 0, 0, 0.7),
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      ),
      var(--background-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }

  :host([image][icon-bg]) ha-card::before {
    background-image: none;
  }

  ha-card::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--background-color-card);

    opacity: var(--opacity-theme, var(--background-opacity-card));
  }
`;

/**
 * Grid layout and positioning
 */
const gridLayoutStyles = css`
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
    position: relative; /* For absolute positioning of clickable area */
  }

  /* clickable overlay */
  .hitbox {
    grid-column: 1 / 4; /* Spans columns 1-3 */
    grid-row: 1 / 6; /* Spans all rows */
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    z-index: 2; /* High enough to be clickable */
  }

  .info {
    grid-area: i;
    width: 100%;
    margin: 5% 0px 0px 10%;
    container-type: inline-size;
  }

  entity-collection {
    grid-area: e;
  }

  /* Room area styling - Large square shape */
  .room {
    grid-area: r;
    width: var(--user-room-icon-size, 150%);
    aspect-ratio: 1 / 1;
  }
`;

/**
 * Entity and component area styles
 */
const entityAreaStyles = css`
  /* Statistics text */
  .stats {
    font-size: 0.8em;
    opacity: var(--text-opacity-theme, 0.4);
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
    cursor: pointer;
    align-self: center;
    position: relative;
    display: flex;
    justify-content: center;
    aspect-ratio: 1 / 1;
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
  }

  /* Icon background image styling */
  :host([image][icon-bg]) .icon::before {
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.4),
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      ),
      var(--background-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    opacity: var(--icon-opacity);
    --mdc-icon-size: 100%;
  }
`;

/**
 * Status entity indicator
 */
const statusEntityStyles = css`
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
    z-index: 1;
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
  /* Room name styling */
  .name {
    font-size: clamp(1rem, 6cqw, 2rem);
    color: var(--text-color);
  }
`;

/**
 * Combined styles for the Room Summary Card
 * Exports all style categories as a single CSS template
 */
export const styles = css`
  ${hostThemeStyles}
  ${haCardThemeStyles}
  ${cardContainerStyles}
  ${gridLayoutStyles}
  ${entityAreaStyles}
  ${iconStyles}
  ${sensorLabelStyles}
  ${statusEntityStyles}
  ${occupancyStyles}
`;

/**
 * Sensor styles for individual sensor display
 * Includes layout, icon visibility, and sensor-specific styles
 */
export const sensorStyles = css`
  :host {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    opacity: var(--text-opacity-theme, 0.4);
    margin-left: -2%;
    margin-top: 1%;
  }

  :host([hide-icons]) {
    column-gap: 8px;
    margin-left: 0px;
  }

  :host([layout='stacked']) {
    flex-direction: column;
  }

  :host([layout='bottom']) {
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
  }

  .sensor {
    display: flex;
    align-items: center;
    gap: 4px;
    --mdc-icon-size: var(--user-sensor-icon-size, 20px);
  }

  .sensor ha-state-icon,
  .sensor ha-icon {
    flex-shrink: 0;
  }
`;

/**
 * Entity collection styles for entity icon display
 * Includes grid layout, positioning, and entity-specific styles
 */
export const entityStyles = css`
  :host {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    aspect-ratio: 0.23 / 1;
    padding: 5px 5px 5px 0;
  }

  .entity {
    width: var(--user-entity-icon-size, inherit);
  }

  ${iconStyles}
`;
