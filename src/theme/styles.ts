/**
 * Room Summary Card Styles Module
 *
 * Handles all styling logic and CSS definitions for the Room Summary Card.
 * Includes functions for generating dynamic styles based on state and
 * configuration, as well as static CSS styles for the card layout.
 */

import { css } from 'lit';
import { colorsDark, colorsLight, minimalistThemeColors, themeColors } from '.';

/**
 * Static CSS styles for the Room Summary Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
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

  /* Card container */
  .card {
    padding: 5px;
    border-radius: 20px;
    line-height: normal;
    overflow: hidden;
    position: relative;
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
    z-index: -1;
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
    color: var(--text-color);
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
    height: 150%;
    width: 150%;
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
    display: grid;
    place-items: center;
    color: var(--black-color);
    position: relative;
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
