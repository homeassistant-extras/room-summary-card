import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { EntityInformation } from '@type/room';
import { processHomeAssistantColors, processMinimalistColors } from './colors';
import { getRgbColor } from './get-rgb';
import { type ThresholdResult } from './threshold-color';
import { getViewTheme } from './util/get-view-theme';

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
 * @param thresholdResult - Optional threshold result from the entity configuration.
 * @param active - Optional flag indicating if the entity is in an active state.
 * @returns The resolved color as a string (e.g., hex or rgb), or `undefined` if no color override is determined.
 */
export const getThemeColorOverride = (
  hass: HomeAssistant,
  entity: EntityInformation,
  thresholdResult: ThresholdResult | undefined,
  active?: boolean,
): string | undefined => {
  const { state } = entity;
  if (!state) return undefined;

  // threshold-based colors have the highest priority
  if (thresholdResult?.color) {
    return processHomeAssistantColors(thresholdResult.color);
  }

  // icon color is the second priority - hex colors
  const iconColor = state.attributes?.icon_color;
  if (typeof iconColor === 'string' && iconColor.startsWith('#')) {
    return iconColor;
  }

  const onColorAttr = state.attributes?.on_color;
  const offColorAttr = state.attributes?.off_color;
  const onColor =
    entity.config.on_color ??
    (typeof onColorAttr === 'string' ? onColorAttr : undefined);
  const offColor =
    entity.config.off_color ??
    (typeof offColorAttr === 'string' ? offColorAttr : undefined);
  const rgbColor = getRgbColor(state, onColor ?? '', offColor ?? '', active);

  // If the state has a specific RGB color, return it directly
  if (rgbColor) {
    return rgbColor;
  }

  // Try minimalist colors first if minimalist theme
  const theme = getViewTheme(null, hass);
  const resolvedIconColor = typeof iconColor === 'string' ? iconColor : '';
  if (theme?.startsWith('minimalist-')) {
    const minimalistResult = processMinimalistColors(
      resolvedIconColor,
      onColor,
      offColor,
      state.domain,
      active,
    );
    if (minimalistResult) return minimalistResult;
  }

  // Fallback to Home Assistant colors
  return processHomeAssistantColors(
    typeof iconColor === 'string' ? iconColor : undefined,
    onColor ?? '',
    offColor ?? '',
    active ?? false,
  );
};
