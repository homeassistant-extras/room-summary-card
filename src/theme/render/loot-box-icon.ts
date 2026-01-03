import { hasFeature } from '@config/feature';
import {
  CLIMATE_HVAC_ACTION_TO_MODE,
  CLIMATE_HVAC_MODE_ICONS,
  climateHvacModeIcon,
  type HvacAction,
  type HvacMode,
} from '@hass/data/climate';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';

/**
 * Options for computing an entity's icon
 */
export interface IconComputationOptions {
  /** Optional threshold result containing icon */
  thresholdResult?: { icon?: string };
}

/**
 * Computes the icon to display for an entity based on priority:
 * 1. Configured icon (entity.config.icon)
 * 2. Threshold icon (if configured)
 * 3. Climate icon (if entity is climate and skip_climate_styles is not enabled)
 * 4. undefined (let ha-state-icon use default)
 *
 * @param entity - The entity information containing config and state
 * @param config - The card configuration
 * @param options - Optional parameters for icon computation
 * @returns The icon string to use, or undefined to use default
 */
export const computeEntityIcon = (
  entity: EntityInformation,
  config: Config,
  options: IconComputationOptions = {},
): string | undefined => {
  const { thresholdResult } = options;
  const { state } = entity;

  if (!state) {
    return undefined;
  }

  // Priority 1: Configured icon
  if (entity.config.icon) {
    return entity.config.icon;
  }

  // Priority 2: Threshold icon (if configured)
  if (thresholdResult?.icon) {
    return thresholdResult.icon;
  }

  // Priority 3: Climate icon (if applicable)
  const useClimateIcons =
    !hasFeature(config, 'skip_climate_styles') && state.domain === 'climate';
  if (useClimateIcons) {
    // Prefer hvac_action over state for more accurate icon representation
    const hvacAction = state.attributes?.hvac_action as HvacAction | undefined;
    if (hvacAction && CLIMATE_HVAC_ACTION_TO_MODE[hvacAction]) {
      const mode = CLIMATE_HVAC_ACTION_TO_MODE[hvacAction];
      return CLIMATE_HVAC_MODE_ICONS[mode];
    }

    // Fall back to state.state (which contains the hvac_mode)
    const hvacMode = state.state as HvacMode | undefined;
    if (hvacMode) {
      return climateHvacModeIcon(hvacMode);
    }
  }

  // Priority 4: Let ha-state-icon use default (undefined)
  return undefined;
};
