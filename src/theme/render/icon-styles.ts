import { nothing } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { EntityState } from '@type/config';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Interface for common style data used by both icon and text styling functions
 */
interface StyleData {
  active: boolean;
  cssColor: string | undefined;
  themeOverride: string | undefined;
  activeClass: 'active' | 'inactive';
}

/**
 * Common function to generate style data from entity state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {StyleData | null} Common style data or null if no state
 */
const getStyleData = (
  hass: HomeAssistant,
  state?: EntityState,
): StyleData | null => {
  if (!state) return null;

  const stateObj = state as any as HassEntity;
  const active = stateActive(stateObj);
  const cssColor = stateColorCss(stateObj);
  const themeOverride = getThemeColorOverride(hass, state, active);
  const activeClass = active ? 'active' : 'inactive';

  return {
    active,
    cssColor,
    themeOverride,
    activeClass,
  };
};

/**
 * Generates styles for entity icons based on their state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective>} Style map for icon elements
 */
export const renderEntityIconStyles = (
  hass: HomeAssistant,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> => {
  const styleData = getStyleData(hass, state);

  if (!styleData) return styleMap({});

  return styleMap({
    '--icon-color': styleData.cssColor,
    '--icon-opacity': `var(--opacity-icon-${styleData.activeClass})`,
    '--background-color-icon': styleData.cssColor,
    '--background-opacity-icon': `var(--opacity-icon-fill-${styleData.activeClass})`,
    '--state-color-theme-override': styleData.themeOverride,
  });
};

/**
 * Generates styles for text elements based on entity state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective> | typeof nothing} Style map for text elements or nothing if inactive
 */
export const renderTextStyles = (
  hass: HomeAssistant,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> | typeof nothing => {
  const styleData = getStyleData(hass, state);

  if (!styleData) return nothing;

  return styleData.active
    ? styleMap({
        '--text-color': styleData.cssColor,
        '--state-color-theme-override': styleData.themeOverride,
      })
    : nothing;
};

/**
 * Generates styles for both icon and text elements (backward compatibility)
 *
 * @deprecated Use renderEntityIconStyles and renderTextStyles separately
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {Object} Style maps for icon and text elements
 */
export const renderEntityStyles = (
  hass: HomeAssistant,
  state?: EntityState,
): {
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective> | typeof nothing;
} => {
  return {
    iconStyle: renderEntityIconStyles(hass, state),
    textStyle: renderTextStyles(hass, state),
  };
};

/**
 * Generates styles for problem indicator based on problem existence
 *
 * @param {boolean} problemExists - Whether a problem condition exists
 * @returns {DirectiveResult<typeof StyleMapDirective>} Style map for the problem indicator
 */
export const getProblemEntitiesStyle = (problemExists: boolean) => {
  return styleMap({
    '--background-color-icon': `${
      problemExists ? 'var(--error-color)' : 'var(--success-color)'
    }`,
    '--background-opacity-icon': `${problemExists ? '0.8' : '0.6'}`,
  });
};
