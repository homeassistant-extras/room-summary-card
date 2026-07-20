import { styleMap } from 'lit/directives/style-map.js';

import { stateColorBrightness } from '@homeassistant-extras/hass/common/entity/state_color';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { HassEntity } from '@homeassistant-extras/hass/ws/types';
import { getEntityPictureUrl } from '@theme/image/background-to-hui-config';
import type { EntityInformation } from '@type/room';
import { nothing } from 'lit';
import { getStyleData } from './common-style';

/**
 * Generates a style map for an entity's icon based on its state and theme information.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param entity - The entity information used to determine icon styling.
 * @param isActive - Whether the room is considered active (for styling).
 * @returns A lit-html style map directive with CSS custom properties for icon color, opacity, and theme overrides.
 */
export const renderEntityIconStyles = (
  hass: HomeAssistant,
  entity: EntityInformation,
  isActive?: boolean,
): ReturnType<typeof styleMap> | typeof nothing => {
  const { state } = entity as { state: HassEntity };
  const filter = stateColorBrightness(state);
  const styleData = getStyleData(hass, 'icon', entity, isActive);

  if (!styleData) return nothing;

  // An entity picture paints the icon fill, so show it at full opacity
  // while the entity is active instead of the dimmed fill.
  const opacity =
    getEntityPictureUrl(entity) && styleData.active
      ? '1'
      : `var(--opacity-icon-fill-${styleData.activeClass})`;

  return styleMap({
    '--icon-color': styleData.cssColor,
    '--icon-opacity': `var(--opacity-icon-${styleData.activeClass})`,
    '--background-color-icon': styleData.cssColor,
    '--background-opacity-icon': opacity,
    '--state-color-icon-theme': styleData.themeOverride,
    '--icon-filter': filter,
  });
};
