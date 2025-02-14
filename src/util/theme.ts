/**
 * @file color-definitions.js
 * @description Defines RGB color variables for use in Home Assistant themes and components
 */

import { css } from 'lit';

/**
 * Default RGB color values used in Home Assistant.
 * These variables define the base color palette and are formatted as RGB values (without the rgb() wrapper)
 * to allow for flexible usage in different contexts (rgb, rgba, etc.).
 *
 * Example usage:
 * ```css
 * .my-element {
 *   background-color: rgb(var(--blue-ha-default));
 *   background-color: rgba(var(--blue-ha-default), 0.5); // With opacity
 * }
 * ```
 */
export const homeAssistantRgbColors = css`
  --disabled-ha-default: 189, 189, 189;
  --red-ha-default: 244, 67, 54;
  --pink-ha-default: 233, 30, 99;
  --purple-ha-default: 146, 107, 199;
  --deep-purple-ha-default: 110, 65, 171;
  --indigo-ha-default: 63, 81, 181;
  --blue-ha-default: 33, 150, 243;
  --light-blue-ha-default: 3, 169, 244;
  --cyan-ha-default: 0, 188, 212;
  --teal-ha-default: 0, 150, 136;
  --green-ha-default: 76, 175, 80;
  --light-green-ha-default: 139, 195, 74;
  --lime-ha-default: 205, 220, 57;
  --yellow-ha-default: 255, 235, 59;
  --amber-ha-default: 255, 193, 7;
  --orange-ha-default: 255, 152, 0;
  --deep-orange-ha-default: 255, 111, 34;
  --brown-ha-default: 121, 85, 72;
  --light-grey-ha-default: 189, 189, 189;
  --grey-ha-default: 158, 158, 158;
  --dark-grey-ha-default: 96, 96, 96;
  --blue-grey-ha-default: 96, 125, 139;
  --black-ha-default: 0, 0, 0;
  --white-ha-default: 255, 255, 255;
`;

/**
 * Simplified color variable names that reference the default Home Assistant colors.
 * These variables provide a more concise naming convention while maintaining
 * consistency with the Home Assistant theme system.
 *
 * These variables are designed to be used in components and custom elements
 * where you want to reference the theme colors without coupling to the full
 * Home Assistant naming convention.
 *
 * Example usage:
 * ```css
 * .my-element {
 *   color: rgb(var(--rgb-blue));
 *   background-color: rgba(var(--rgb-grey), 0.2);
 * }
 * ```
 */
export const themeColors = css`
  --rgb-disabled: var(--disabled-ha-default);
  --rgb-red: var(--red-ha-default);
  --rgb-pink: var(--pink-ha-default);
  --rgb-purple: var(--purple-ha-default);
  --rgb-deep-purple: var(--deep-purple-ha-default);
  --rgb-indigo: var(--indigo-ha-default);
  --rgb-blue: var(--blue-ha-default);
  --rgb-light-blue: var(--light-blue-ha-default);
  --rgb-cyan: var(--cyan-ha-default);
  --rgb-teal: var(--teal-ha-default);
  --rgb-green: var(--green-ha-default);
  --rgb-light-green: var(--light-green-ha-default);
  --rgb-lime: var(--lime-ha-default);
  --rgb-yellow: var(--yellow-ha-default);
  --rgb-amber: var(--amber-ha-default);
  --rgb-orange: var(--orange-ha-default);
  --rgb-deep-orange: var(--deep-orange-ha-default);
  --rgb-brown: var(--brown-ha-default);
  --rgb-light-grey: var(--light-grey-ha-default);
  --rgb-grey: var(--grey-ha-default);
  --rgb-dark-grey: var(--dark-grey-ha-default);
  --rgb-blue-grey: var(--blue-grey-ha-default);
  --rgb-black: var(--black-ha-default);
  --rgb-white: var(--white-ha-default);
`;
