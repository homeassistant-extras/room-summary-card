/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css } from 'lit';
import { moldStyles } from './css/mold';
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

  :host([image]) {
    --user-background-image-overlay: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0)
    );
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
      var(--user-background-image-overlay), var(--background-image);
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
    grid-template-areas: var(
      --user-grid-template-areas,
      'i i i e' 'i i i e' 'r r . e' 'r r . e'
    );
    grid-template-columns: var(--user-grid-template-columns, 1fr 1fr 1fr 1fr);
    grid-template-rows: var(--user-grid-template-rows, 1fr 1fr 1fr 1fr);
    justify-items: center;
    aspect-ratio: var(--user-grid-aspect-ratio, 1/1);
    height: 100%;
    width: 100%;
    position: relative; /* For absolute positioning of clickable area */
  }

  .text {
    cursor: pointer;
  }

  .info {
    grid-area: i;
    width: 100%;
    margin: 5% 0px 0px 10%;
    container-type: inline-size;
  }

  entity-collection,
  entity-slider {
    grid-area: e;
  }

  /* Room area styling - Large square shape */
  room-state-icon[room] {
    grid-area: r;
    width: var(--user-room-icon-size, 150%);
    aspect-ratio: 1 / 1;
    align-self: center;
  }

  room-state-icon[room].hidden {
    opacity: 0;
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
    width: fit-content; /* don't cover other elements plz */
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
  .problems {
    grid-area: 4 / 1 / 4 / 1;
    align-self: end;
    justify-self: start;
    margin-left: 10%;
    margin-bottom: 10%;
    display: flex;
    gap: 5px;
    align-items: center;
  }

  /* Status entities indicator */
  .status-entities {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    color: var(--black-color);
    position: relative;
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
    background-color: var(--success-color);
    opacity: 0.6;
    z-index: -1;
  }

  /* Problem state styling */
  .status-entities[has-problems]::before {
    background-color: var(--error-color);
    opacity: 0.8;
    animation: problem-pulse 2s ease-in-out infinite;
  }

  /* Problem pulse animation */
  @keyframes problem-pulse {
    0%,
    100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }
`;

/**
 * Sensor and label display styles
 */
const sensorLabelStyles = css`
  /* Room name styling */
  .name {
    font-size: clamp(1.2rem, 6cqw, 2rem);
    font-weight: 500;
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
  ${moldStyles}
`;
