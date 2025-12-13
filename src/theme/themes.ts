/**
 * @file color-definitions.js
 * @description Defines RGB color variables for use in Home Assistant themes and components
 */

import { css } from 'lit';

export const homeAssistantColors = [
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

export const minimalistColors = [
  'red',
  'green',
  'yellow',
  'blue',
  'purple',
  'grey',
  'pink',
  'theme',
];

export const minimalistThemeColors = css`
  --theme-color-minimalist: rgb(var(--color-theme));
`;

/**
 * Frosted Glass theme CSS variables
 * Provides glass effect styling when the Frosted Glass theme is active
 * Uses standard Home Assistant root-level theme variables
 * @see https://github.com/wessamlauf/homeassistant-frosted-glass-themes
 */
export const frostedGlassThemeColors = css`
  /* Glass effect - uses standard HA card variables set by the theme */
  --theme-box-shadow-frosted: var(--ha-card-box-shadow);
  --theme-border-color-frosted: var(--ha-card-border-color);
  --theme-border-width-frosted: var(--ha-card-border-width);
  --theme-border-radius-frosted: var(--ha-card-border-radius);

  /* Frosted Glass sets backdrop-filter via card-mod, but we can pick it up if available */
  --theme-backdrop-filter-frosted: var(
    --ha-card-backdrop-filter,
    var(--app-header-backdrop-filter, none)
  );

  /* Tint + sheen (these are used as var() knobs in Frosted Glass' card-mod styles) */
  --theme-glass-tint-frosted: var(
    --ha-card-glass-tint,
    rgba(255, 255, 255, 0.08)
  );
  --theme-glass-inset-shadow-frosted: var(
    --ha-card-glass-inset-shadow,
    3px 3px 0.5px -3.5px rgba(255, 255, 255, 0.3) inset,
    -2px -2px 0.5px -2px rgba(255, 255, 255, 0.3) inset,
    0 0 8px 1px rgba(255, 255, 255, 0.1) inset,
    0 0 2px 0 rgba(0, 0, 0, 0.1)
  );
`;

export const themeColors = css`
  --theme-background-color-card: var(
    --ha-card-background,
    var(--card-background-color, white)
  );
  --theme-background-color-icon: var(
    --theme-color-minimalist,
    var(--state-icon-color, white)
  );
  --theme-color-icon: var(
    --theme-color-minimalist,
    var(--state-icon-color, white)
  );

  --opacity-icon-active: 1;
  --opacity-icon-inactive: 0.2;
`;

export const colorsLight = css`
  --opacity-background-active: 0.1;
  --opacity-background-inactive: 1;

  --opacity-icon-fill-active: 0.2;
  --opacity-icon-fill-inactive: 0.1;
`;

export const colorsDark = css`
  --opacity-background-active: 0.1;
  --opacity-background-inactive: 1;

  --opacity-icon-fill-active: 0.2;
  --opacity-icon-fill-inactive: 0.05;
`;
