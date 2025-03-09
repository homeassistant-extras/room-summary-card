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
  --opacity-background-active: 1;
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
