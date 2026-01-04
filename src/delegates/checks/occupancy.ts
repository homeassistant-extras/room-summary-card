import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { AlarmConfig } from '@type/config';

/**
 * Checks if an entity is currently detecting an alarm condition
 * @param hass Home Assistant instance
 * @param entityId Entity ID of the sensor
 * @returns True if condition is detected, false otherwise
 */
const isEntityDetected = (hass: HomeAssistant, entityId: string): boolean => {
  const entity = hass.states[entityId];
  if (!entity) return false;

  return stateActive(entity);
};

/**
 * Gets the current alarm state for a configured alarm sensor
 * @param hass Home Assistant instance
 * @param config Alarm configuration
 * @returns True if condition is detected, false otherwise
 */
const getAlarmState = (hass: HomeAssistant, config?: AlarmConfig): boolean => {
  if (!config) return false;
  // Check if any of the entities detect the condition
  return config.entities.some((entityId) => isEntityDetected(hass, entityId));
};

/**
 * Gets CSS variables for alarm styling based on current state
 * @param isDetected Current detection state
 * @param config Alarm configuration
 * @param prefix CSS variable prefix (e.g., 'occupancy' or 'smoke')
 * @param defaultColor Default color to use (e.g., 'var(--success-color)' or 'var(--error-color)')
 * @param animationName Animation name (e.g., 'occupancy-pulse' or 'smoke-pulse')
 * @returns Object with CSS variable names and values
 */
const getAlarmCssVars = (
  isDetected: boolean,
  config?: AlarmConfig,
  prefix: string = 'alarm',
  defaultColor: string = 'var(--primary-color)',
  animationName: string = 'alarm-pulse',
): Record<string, string> => {
  if (!config) return {};

  const vars: Record<string, string> = {};

  if (!isDetected) return vars;

  // Set card border variable (3px solid) unless disabled
  const isCardBorderDisabled = config.options?.includes('disabled_card_styles');
  if (!isCardBorderDisabled) {
    const borderColor = config.card_border_color ?? defaultColor;
    vars[`--${prefix}-card-border`] = `3px solid ${borderColor}`;
    vars[`--${prefix}-card-border-color`] = borderColor;

    // Set animation unless disabled
    const isAnimationDisabled = config.options?.includes(
      'disabled_card_styles_animation',
    );
    if (!isAnimationDisabled) {
      vars[`--${prefix}-card-animation`] =
        `${animationName} 2s ease-in-out infinite alternate`;
    }
  }

  // Icon color styling
  const isIconColorDisabled = config.options?.includes('disable_icon_styles');
  if (!isIconColorDisabled) {
    const iconColor = config.icon_color ?? defaultColor;
    vars[`--${prefix}-icon-color`] = iconColor;

    // Set animation unless disabled
    const isIconAnimationDisabled = config.options?.includes(
      'disable_icon_animation',
    );
    if (!isIconAnimationDisabled) {
      vars[`--${prefix}-icon-animation`] =
        'icon-breathe 3s ease-in-out infinite alternate';
    }
  }

  return vars;
};

/**
 * Gets the current occupancy state for a configured occupancy sensor
 * @param hass Home Assistant instance
 * @param config Occupancy configuration
 * @returns True if occupancy is detected, false otherwise
 */
export const getOccupancyState = (
  hass: HomeAssistant,
  config?: AlarmConfig,
): boolean => {
  return getAlarmState(hass, config);
};

/**
 * Gets CSS variables for occupancy styling based on current state
 * @param isOccupied Current occupancy state
 * @param config Occupancy configuration
 * @returns Object with CSS variable names and values
 */
export const getOccupancyCssVars = (
  isOccupied: boolean,
  config?: AlarmConfig,
): Record<string, string> => {
  return getAlarmCssVars(
    isOccupied,
    config,
    'occupancy',
    'var(--success-color)',
    'occupancy-pulse',
  );
};

/**
 * Gets the current smoke state for a configured smoke detector
 * @param hass Home Assistant instance
 * @param config Smoke configuration
 * @returns True if smoke is detected, false otherwise
 */
export const getSmokeState = (
  hass: HomeAssistant,
  config?: AlarmConfig,
): boolean => {
  return getAlarmState(hass, config);
};

/**
 * Gets CSS variables for smoke styling based on current state
 * @param isSmokeDetected Current smoke detection state
 * @param config Smoke configuration
 * @returns Object with CSS variable names and values
 */
export const getSmokeCssVars = (
  isSmokeDetected: boolean,
  config?: AlarmConfig,
): Record<string, string> => {
  return getAlarmCssVars(
    isSmokeDetected,
    config,
    'smoke',
    'var(--error-color)',
    'smoke-pulse',
  );
};

/**
 * Gets the current gas state for a configured gas detector
 * @param hass Home Assistant instance
 * @param config Gas configuration
 * @returns True if gas is detected, false otherwise
 */
export const getGasState = (
  hass: HomeAssistant,
  config?: AlarmConfig,
): boolean => {
  return getAlarmState(hass, config);
};

/**
 * Gets CSS variables for gas styling based on current state
 * @param isGasDetected Current gas detection state
 * @param config Gas configuration
 * @returns Object with CSS variable names and values
 */
export const getGasCssVars = (
  isGasDetected: boolean,
  config?: AlarmConfig,
): Record<string, string> => {
  return getAlarmCssVars(isGasDetected, config, 'gas', '#FF9800', 'gas-pulse');
};

/**
 * Gets the current water state for a configured water sensor
 * @param hass Home Assistant instance
 * @param config Water configuration
 * @returns True if water is detected, false otherwise
 */
export const getWaterState = (
  hass: HomeAssistant,
  config?: AlarmConfig,
): boolean => {
  return getAlarmState(hass, config);
};

/**
 * Gets CSS variables for water styling based on current state
 * @param isWaterDetected Current water detection state
 * @param config Water configuration
 * @returns Object with CSS variable names and values
 */
export const getWaterCssVars = (
  isWaterDetected: boolean,
  config?: AlarmConfig,
): Record<string, string> => {
  return getAlarmCssVars(
    isWaterDetected,
    config,
    'water',
    '#2196F3',
    'water-pulse',
  );
};
