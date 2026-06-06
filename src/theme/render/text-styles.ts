import { hasFeature } from '@homeassistant-extras/hass/common/config/feature';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { processHomeAssistantColors } from '@theme/colors';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { getStyleData } from './common-style';

/**
 * Renders dynamic text styles for a component based on the current Home Assistant state,
 * configuration, and entity information. If the 'skip_entity_styles' feature is enabled in the config,
 * or if no style data is available, no styles are applied.
 *
 * @param hass - The Home Assistant instance providing state and theme information.
 * @param config - The configuration object that may include feature flags and style preferences.
 * @param entity - Information about the entity for which styles are being rendered.
 * @param isActive - Whether the room is considered active (for styling).
 * @returns A style-map directive with CSS variables for text color and theme override,
 *          or `nothing` if styles should not be applied.
 */
export const renderTextStyles = (
  hass: HomeAssistant,
  config: Config,
  entity: EntityInformation,
  isActive?: boolean,
): ReturnType<typeof styleMap> | typeof nothing => {
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  if (skipStyles) return nothing;

  const styleData = getStyleData(hass, 'text', entity, isActive);

  if (!styleData) return nothing;

  // Check if titleColor is specified in threshold/state result
  const titleColor = styleData.thresholdResult?.titleColor
    ? processHomeAssistantColors(styleData.thresholdResult.titleColor)
    : styleData.cssColor;

  return styleData.active
    ? styleMap({
        '--text-color': titleColor,
        '--state-color-text-theme': styleData.themeOverride,
        ...config.styles?.title,
      })
    : styleMap({
        '--text-color': titleColor,
        ...config.styles?.title,
      });
};
