import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';
import { processHomeAssistantColors, processMinimalistColors } from './colors';
import { getRgbColor } from './get-rgb';

/**
 * Determines the appropriate theme color based on entity state and active status
 * This function handles both default Home Assistant themes and Minimalist themes
 *
 * @param hass - The Home Assistant instance containing theme information
 * @param state - The entity state object (optional)
 * @param active - Boolean indicating if the entity is in an active state (optional)
 * @returns A CSS color variable string or undefined if no appropriate color is found
 */
export const getThemeColorOverride = (
  hass: HomeAssistant,
  state?: EntityState,
  active?: boolean,
) => {
  if (!state) return undefined;

  // icon color is the first priority - hex colors
  const iconColor = state.attributes.icon_color;
  if (iconColor?.startsWith('#')) {
    return iconColor;
  }

  const onColor = state.attributes.on_color;
  const offColor = state?.attributes?.off_color;
  const rgbColor = getRgbColor(state, onColor, offColor, active);

  // If the state has a specific RGB color, return it directly
  if (rgbColor) {
    return rgbColor;
  }

  // Try minimalist colors first if minimalist theme
  if (hass.themes.theme.startsWith('minimalist-')) {
    const minimalistResult = processMinimalistColors(
      iconColor,
      onColor,
      offColor,
      state.domain,
      active,
    );
    if (minimalistResult) return minimalistResult;
  }

  // Fallback to Home Assistant colors
  return processHomeAssistantColors(iconColor, onColor, offColor, active);
};
