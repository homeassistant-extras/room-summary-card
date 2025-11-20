import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';

import { hasFeature } from '@config/feature';
import {
  getOccupancyCssVars,
  getSmokeCssVars,
} from '@delegates/checks/occupancy';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { getThresholdResult } from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { getBackgroundOpacity } from '../background/background-bits';
import { getThemeColorOverride } from '../custom-theme';

/**
 * Generates a style map for a card component based on the current Home Assistant theme,
 * entity state, configuration, optional background image, occupancy state, and smoke detection.
 *
 * @param hass - The Home Assistant instance containing theme and state information.
 * @param config - The configuration object for the card.
 * @param entity - The entity information, including its current state.
 * @param isOccupied - Whether the room is occupied.
 * @param isSmokeDetected - Whether smoke is detected (takes priority over occupancy).
 * @param image - (Optional) A URL or path to a background image for the card.
 * @param isActive - Whether the room is considered active (for styling).
 * @returns A DirectiveResult containing the computed style map for the card.
 */
export const renderCardStyles = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  isOccupied: boolean,
  isSmokeDetected: boolean,
  image?: string | null,
  isActive?: boolean,
): DirectiveResult<typeof StyleMapDirective> => {
  const { state } = entity as { state: HassEntity };
  const active = isActive ?? false;
  const thresholdResult = getThresholdResult(entity);
  const themeOverride = getThemeColorOverride(
    hass,
    entity,
    thresholdResult,
    active,
  );
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const opacity = getBackgroundOpacity(config, active);
  // Smoke takes priority over occupancy - if smoke is detected, use smoke CSS vars
  const alarmVars = isSmokeDetected
    ? getSmokeCssVars(isSmokeDetected, config.smoke)
    : getOccupancyCssVars(isOccupied, config.occupancy);
  const cssColor = stateColorCss(state, 'card', active);

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
    ...alarmVars,
    ...config.styles?.card,
  });
};
