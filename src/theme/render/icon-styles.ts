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
 * Generates styles for entity icons based on their state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {Object} Style maps for icon and text elements
 */
export const renderEntityIconStyles = (
  hass: HomeAssistant,
  state?: EntityState,
): {
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective>;
} => {
  if (!state) return { iconStyle: nothing, textStyle: nothing };

  const stateObj = state as any as HassEntity;
  const active = stateActive(stateObj);
  const cssColor = stateColorCss(stateObj);
  const themeOverride = getThemeColorOverride(hass, state, active);
  const activeClass = active ? 'active' : 'inactive';

  return {
    // Icon color styles
    iconStyle: styleMap({
      '--icon-color': cssColor,
      '--icon-opacity': `var(--opacity-icon-${activeClass})`,
      '--background-color-icon': cssColor,
      '--background-opacity-icon': `var(--opacity-icon-fill-${activeClass})`,
      '--state-color-theme-override': themeOverride,
    }),

    // Text color styles
    textStyle: active
      ? styleMap({
          '--text-color': cssColor,
        })
      : nothing,
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
