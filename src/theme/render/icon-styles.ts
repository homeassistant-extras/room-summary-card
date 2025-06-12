import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/room';
import { getStyleData } from './common-style';

/**
 * Generates a style map for an entity's icon based on its state and theme information.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param entity - The entity information used to determine icon styling.
 * @returns A lit-html style map directive with CSS custom properties for icon color, opacity, and theme overrides.
 */
export const renderEntityIconStyles = (
  hass: HomeAssistant,
  entity: EntityInformation,
): DirectiveResult<typeof StyleMapDirective> => {
  const styleData = getStyleData(hass, 'icon', entity);

  if (!styleData) return styleMap({});

  return styleMap({
    '--icon-color': styleData.cssColor,
    '--icon-opacity': `var(--opacity-icon-${styleData.activeClass})`,
    '--background-color-icon': styleData.cssColor,
    '--background-opacity-icon': `var(--opacity-icon-fill-${styleData.activeClass})`,
    '--state-color-icon-theme': styleData.themeOverride,
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
