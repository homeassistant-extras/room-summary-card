import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';
import { getStyleData } from './common-style';

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
