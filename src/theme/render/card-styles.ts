import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { hasFeature } from '@config/feature';
import { getOccupancyCssVars } from '@delegates/checks/occupancy';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { getBackgroundOpacity } from '../background/background-bits';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Generates a style map for a card component based on the current Home Assistant theme,
 * entity state, configuration, optional background image, and occupancy state.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param config - The configuration object for the card.
 * @param entity - The entity information, including its current state.
 * @param isOccupied - Whether the room is occupied.
 * @param image - (Optional) A URL or path to a background image for the card.
 * @param isActive - Whether the room is considered active (for styling).
 * @returns A DirectiveResult containing the computed style map for the card.
 */
export const renderCardStyles = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  isOccupied: boolean,
  image?: string | null,
  isActive?: boolean,
): DirectiveResult<typeof StyleMapDirective> => {
  const { state } = entity as { state: HassEntity };
  const active = hass.themes.darkMode && (isActive ?? false);
  const themeOverride = getThemeColorOverride(hass, entity, active);
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const opacity = getBackgroundOpacity(config, active);
  const occupancy = getOccupancyCssVars(isOccupied, config.occupancy);
  const cssColor = hass.themes.darkMode
    ? stateColorCss(state, 'card', active)
    : undefined;

  let backgroundColorCard: string | undefined;
  if (skipStyles) {
    backgroundColorCard = undefined;
  } else {
    backgroundColorCard = active ? cssColor : undefined;
  }

  // Return complete style map
  return styleMap({
    '--background-color-card': backgroundColorCard,
    '--state-color-card-theme': themeOverride,
    '--background-image': image ? `url(${image})` : undefined,
    ...opacity,
    ...occupancy,
    ...config.styles?.card,
  });
};
