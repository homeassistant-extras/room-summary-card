import type { HomeAssistant } from '@hass/types';
import type { EntityInformation } from '@type/room';
import { processHomeAssistantColors, processMinimalistColors } from './colors';
import { getRgbColor } from './get-rgb';
import { getThresholdColor } from './threshold-color';

/**
 * Determines the appropriate theme color override for a given entity based on its state,
 * configuration, and the current Home Assistant theme.
 *
 * The function prioritizes the following sources for the color:
 * 1. Threshold-based colors from entity configuration.
 * 2. The `icon_color` attribute if it is a hex color.
 * 3. The entity's `on_color` or `off_color` configuration or state attributes, processed via `getRgbColor`.
 * 4. Minimalist theme-specific color processing if the active theme starts with "minimalist-".
 * 5. Fallback to Home Assistant's default color processing.
 *
 * @param hass - The Home Assistant instance containing theme information.
 * @param entity - The entity information, including state and configuration.
 * @param active - Optional flag indicating if the entity is in an active state.
 * @returns The resolved color as a string (e.g., hex or rgb), or `undefined` if no color override is determined.
 */
export const getThemeColorOverride = (
  hass: HomeAssistant,
  entity: EntityInformation,
  active?: boolean,
): string | undefined => {
  const { state } = entity;
  if (!state) return undefined;

  // threshold-based colors have the highest priority
  const thresholdColor = getThresholdColor(entity);
  if (thresholdColor) {
    return thresholdColor;
  }

  // icon color is the second priority - hex colors
  const iconColor = state.attributes.icon_color;
  if (iconColor?.startsWith('#')) {
    return iconColor;
  }

  const onColor = entity.config.on_color ?? state.attributes.on_color;
  const offColor = entity.config.off_color ?? state?.attributes?.off_color;
  const rgbColor = getRgbColor(state, onColor, offColor, active);

  // If the state has a specific RGB color, return it directly
  if (rgbColor) {
    return rgbColor;
  }

  // Try minimalist colors first if minimalist theme
  if (hass.themes.theme?.startsWith('minimalist-')) {
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
