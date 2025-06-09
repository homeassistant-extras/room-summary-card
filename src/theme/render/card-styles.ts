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
import type { Config, EntityState } from '@type/config';
import { getBackgroundOpacity } from '../background/background-bits';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Generates dynamic card styles based on state and sensor readings
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - Configuration object
 * @param {string | null} [image] - Optional image URL
 * @param {EntityState} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective>} Style map for the card
 */
export const renderCardStyles = (
  hass: HomeAssistant,
  config: Config,
  image?: string | null,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> => {
  // as of now, only dark mode handles background coloring
  const stateObj = state as any as HassEntity;
  const active = hass.themes.darkMode && stateActive(stateObj);
  const themeOverride = getThemeColorOverride(hass, state, active);
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
  });
};
