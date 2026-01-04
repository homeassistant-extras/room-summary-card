import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { hasFeature } from '@config/feature';
import {
  getGasCssVars,
  getOccupancyCssVars,
  getSmokeCssVars,
  getWaterCssVars,
} from '@delegates/checks/occupancy';
import type { ClimateThresholds } from '@delegates/checks/thresholds';
import { stateActive } from '@hass/common/entity/state_active';
import {
  stateColorBrightness,
  stateColorCss,
} from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { getThresholdResult } from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';
import { getBackgroundOpacity } from '../background/background-bits';
import { getThemeColorOverride } from '../custom-theme';
import { getRgbColor } from '../get-rgb';

/**
 * Generates a style map for a card component based on the current Home Assistant theme,
 * entity state, configuration, optional background image, occupancy state, smoke detection, and climate thresholds.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param config - The configuration object for the card.
 * @param entity - The entity information, including its current state.
 * @param alarm - Current alarm state: 'smoke', 'gas', 'water', 'occupied', or undefined.
 * @param image - (Optional) A URL or path to a background image for the card.
 * @param isActive - Whether the room is considered active (for styling).
 * @param thresholds - Climate threshold results containing hot/humid flags and custom colors.
 * @param ambientLightEntities - (Optional) Array of ambient light entity states for background color.
 * @returns A DirectiveResult containing the computed style map for the card.
 */
export const renderCardStyles = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  alarm?: 'smoke' | 'gas' | 'water' | 'occupied',
  image?: string | null,
  isActive: boolean = false,
  thresholds?: ClimateThresholds,
  ambientLightEntities?: EntityState[],
): DirectiveResult<typeof StyleMapDirective> => {
  const { state } = entity as { state: HassEntity };
  const thresholdResult = getThresholdResult(entity);

  // Find the first active ambient light for background color
  const activeAmbientLight = ambientLightEntities?.find((light) =>
    stateActive(light),
  );

  // Get theme override - use ambient light's color if active, otherwise use entity's color
  let themeOverride: string | undefined;
  if (activeAmbientLight) {
    // Extract RGB color from the active ambient light
    themeOverride = getRgbColor(activeAmbientLight, '', '', true);
  }
  // Fall back to entity's theme color if no ambient light color
  if (!themeOverride) {
    themeOverride = getThemeColorOverride(
      hass,
      entity,
      thresholdResult,
      isActive,
    );
  }

  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const opacity = getBackgroundOpacity(config, isActive);
  // Get alarm CSS vars based on current alarm state
  let alarmVars: Record<string, string> = {};
  if (alarm === 'smoke') {
    alarmVars = getSmokeCssVars(true, config.smoke);
  } else if (alarm === 'gas') {
    alarmVars = getGasCssVars(true, config.gas);
  } else if (alarm === 'water') {
    alarmVars = getWaterCssVars(true, config.water);
  } else if (alarm === 'occupied') {
    alarmVars = getOccupancyCssVars(true, config.occupancy);
  }

  // Use ambient light's state for color if active, otherwise use entity's state
  const stateForColor = activeAmbientLight || state;
  const cssColor = stateColorCss(stateForColor as HassEntity, 'card', isActive);
  const filter = stateColorBrightness(stateForColor as HassEntity);

  let backgroundColorCard: string | undefined;
  if (skipStyles) {
    backgroundColorCard = undefined;
  } else {
    backgroundColorCard = isActive ? cssColor : undefined;
  }

  // Generate threshold CSS variables
  const thresholdVars: Record<string, string | undefined> = {};
  if (thresholds) {
    if (thresholds.hot && thresholds.hotColor) {
      thresholdVars['--threshold-hot-color'] = thresholds.hotColor;
    }
    if (thresholds.humid && thresholds.humidColor) {
      thresholdVars['--threshold-humid-color'] = thresholds.humidColor;
    }
  }

  // Return complete style map
  return styleMap({
    '--background-color-card': backgroundColorCard,
    '--state-color-card-theme': themeOverride,
    '--background-image': image ? `url(${image})` : undefined,
    '--background-filter': filter,
    ...opacity,
    ...alarmVars,
    ...thresholdVars,
    ...config.styles?.card,
  });
};
