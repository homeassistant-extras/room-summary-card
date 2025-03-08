import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';
import { homeAssistantColors, minimalistColors } from './themes';

/**
 * Maps Home Assistant domains to their conventional active state colors
 * Returns a color name from the standard HA_COLORS list
 *
 * @param domain - The Home Assistant domain (e.g., 'light', 'switch', 'cover')
 * @returns Color name from HA_COLORS (e.g., 'amber', 'blue')
 */
const activeColorFromDomain = (domain: string | undefined) => {
  switch (domain) {
    // Lighting
    case 'light':
    case 'switch_as_x':
      return 'yellow';

    // Switches & Electric
    case 'switch':
    case 'input_boolean':
    case 'automation':
    case 'script':
      return 'blue';

    // Climate & Environment
    case 'climate':
    case 'fan':
      return 'teal';

    // Security & Safety
    case 'alarm_control_panel':
    case 'lock':
      return 'red';

    // Covers & Doors
    case 'cover':
    case 'garage_door':
    case 'door':
      return 'green';

    // Media
    case 'media_player':
      return 'indigo';

    // Sensors & Binary Sensors
    case 'binary_sensor':
    case 'sensor':
      return 'cyan';

    // Person & Presence
    case 'person':
    case 'device_tracker':
      return 'purple';

    // Weather & Update
    case 'weather':
    case 'update':
      return 'orange';

    // Vacuum
    case 'vacuum':
      return 'deep-purple';

    // Timer & Schedule
    case 'timer':
    case 'schedule':
      return 'pink';

    // Default for unknown domains
    default:
      return 'yellow';
  }
};

/**
 * Determines the appropriate theme color based on entity state and active status
 * This function handles both default Home Assistant themes and Minimalist themes
 *
 * @param hass - The Home Assistant instance containing theme information
 * @param state - The entity state object (optional)
 * @param active - Boolean indicating if the entity is in an active state (optional)
 * @returns A CSS color variable string or undefined if no appropriate color is found
 *
 * @example
 * // For a light entity in active state with default theme
 * const color = getThemeColorOverride(hass, lightState, true);
 * // Returns something like "var(--yellow-color)" if conditions are met
 *
 * @example
 * // For an inactive entity with minimalist theme
 * const color = getThemeColorOverride(hass, entityState, false);
 * // Returns something like "rgb(var(--color-grey))" if conditions are met
 */
export const getThemeColorOverride = (
  hass: HomeAssistant,
  state?: EntityState,
  active?: boolean,
) => {
  if (!state) return undefined;
  const onColor = state.attributes.on_color;
  const offColor = state?.attributes?.off_color;

  if (hass.themes.theme === 'default') {
    // only overwrite default theme if explicitly set
    if (active && onColor && homeAssistantColors.includes(onColor)) {
      return `var(--${onColor}-color)`;
    }
    if (!active && offColor && homeAssistantColors.includes(offColor)) {
      return `var(--${offColor}-color)`;
    }
  } else if (hass.themes.theme.startsWith('minimalist-')) {
    // for minimalist - try and match a color based on domain
    const color = active
      ? onColor || activeColorFromDomain(state.domain)
      : offColor;
    if (minimalistColors.includes(color)) {
      return `rgb(var(--color-${color}))`;
    }
  }

  return undefined;
};
