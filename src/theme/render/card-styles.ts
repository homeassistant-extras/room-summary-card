import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { hasFeature } from '@config/feature';
import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { getBackgroundOpacity } from '../background/background-bits';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Generates a style map for a card component based on the current Home Assistant theme,
 * entity state, configuration, and optional background image.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param config - The configuration object for the card.
 * @param entity - The entity information, including its current state.
 * @param image - (Optional) A URL or path to a background image for the card.
 * @returns A DirectiveResult containing the computed style map for the card.
 */
export const renderCardStyles = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  image?: string | null,
): DirectiveResult<typeof StyleMapDirective> => {
  const { state } = entity;
  const stateObj = state as any as HassEntity;
  const active = hass.themes.darkMode && stateActive(stateObj);
  const themeOverride = getThemeColorOverride(hass, entity, active);
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const opacity = getBackgroundOpacity(hass, config, state);
  const cssColor = hass.themes.darkMode
    ? stateColorCss(stateObj, 'card')
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
    ...config.styles?.card,
  });
};
