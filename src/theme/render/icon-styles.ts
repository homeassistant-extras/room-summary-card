import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { nothing } from 'lit';
import { getStyleData } from './common-style';

/**
 * Generates a style map for an entity's icon based on its state and theme information.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param entity - The entity information used to determine icon styling.
 * @param isActive - Whether the room is considered active (for styling).
 * @param image - The image to use for the icon background.
 * @param isMainRoomEntity - Whether the entity is the main room entity.
 * @param config - The configuration object (optional, used for opacity when image is present).
 * @returns A lit-html style map directive with CSS custom properties for icon color, opacity, and theme overrides.
 */
export const renderEntityIconStyles = (
  hass: HomeAssistant,
  entity: EntityInformation,
  isActive?: boolean,
  image?: string | null,
  isMainRoomEntity?: boolean,
  config?: Config,
): DirectiveResult<typeof StyleMapDirective> | typeof nothing => {
  const styleData = getStyleData(hass, 'icon', entity, isActive);

  if (!styleData) return nothing;

  // Calculate opacity for image backgrounds
  // Apply opacity to icon only if icon_background option is set
  const isIconBackground =
    config?.background?.options?.includes('icon_background') ?? false;
  const userOpacity =
    config?.background?.opacity && isIconBackground && isMainRoomEntity
      ? config.background.opacity / 100
      : undefined;

  const opacity =
    userOpacity ??
    (image && styleData.active
      ? '1'
      : `var(--opacity-icon-fill-${styleData.activeClass})`);

  return styleMap({
    '--icon-color': styleData.cssColor,
    '--icon-opacity': `var(--opacity-icon-${styleData.activeClass})`,
    '--background-color-icon': styleData.cssColor,
    '--background-opacity-icon': opacity,
    '--state-color-icon-theme': styleData.themeOverride,
    '--background-image': image ? `url(${image})` : undefined,
  });
};
