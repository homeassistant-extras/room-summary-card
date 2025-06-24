import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { OccupancyConfig } from '@type/config';

/**
 * Checks if an occupancy sensor entity is currently detecting motion/presence
 * @param hass Home Assistant instance
 * @param entityId Entity ID of the occupancy sensor
 * @returns True if occupancy is detected, false otherwise
 */
const isOccupancyDetected = (
  hass: HomeAssistant,
  entityId: string,
): boolean => {
  const entity = hass.states[entityId];
  if (!entity) return false;

  return stateActive(entity);
};

/**
 * Gets the current occupancy state for a configured occupancy sensor
 * @param hass Home Assistant instance
 * @param config Occupancy configuration
 * @returns OccupancyState object with current state and config
 */
export const getOccupancyState = (
  hass: HomeAssistant,
  config?: OccupancyConfig,
): boolean => {
  if (!config) return false;
  // Check if any of the entities detect occupancy
  const isOccupied = config.entities.some((entityId) =>
    isOccupancyDetected(hass, entityId),
  );

  return isOccupied;
};

/**
 * Gets CSS variables for occupancy styling based on current state
 * @param occupancyState Current occupancy state
 * @returns Object with CSS variable names and values
 */
export const getOccupancyCssVars = (
  isOccupied: boolean,
  config?: OccupancyConfig,
): Record<string, string> => {
  if (!config) return {};

  const vars: Record<string, string> = {};

  if (!isOccupied) return vars;

  // Set card border variable (3px solid) unless disabled
  const isCardBorderDisabled = config.options?.includes('disabled_card_styles');
  if (!isCardBorderDisabled) {
    const borderColor = config.card_border_color ?? 'var(--success-color)';
    vars['--occupancy-card-border'] = `3px solid ${borderColor}`;
    vars['--occupancy-card-border-color'] = borderColor;

    // Set animation unless disabled
    const isAnimationDisabled = config.options?.includes(
      'disabled_card_styles_animation',
    );
    if (!isAnimationDisabled) {
      vars['--occupancy-card-animation'] =
        'occupancy-pulse 2s ease-in-out infinite alternate';
    }
  }

  // Icon color styling
  const isIconColorDisabled = config.options?.includes('disable_icon_styles');
  if (!isIconColorDisabled) {
    const iconColor = config.icon_color ?? 'var(--success-color)';
    vars['--occupancy-icon-color'] = iconColor;

    // Set animation unless disabled
    const isIconAnimationDisabled = config.options?.includes(
      'disable_icon_animation',
    );
    if (!isIconAnimationDisabled) {
      vars['--occupancy-icon-animation'] =
        'icon-breathe 3s ease-in-out infinite alternate';
    }
  }

  return vars;
};
