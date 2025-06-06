import { hasFeature } from '@config/feature';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityState } from '@type/config';
import { nothing } from 'lit';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';
import type { DirectiveResult } from 'lit/directive';
import { getStyleData } from './common-style';

/**
 * Generates styles for text elements based on entity state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - Configuration object
 * @param {EntityState} [state] - Current entity state
 * @returns {DirectiveResult<typeof StyleMapDirective> | typeof nothing} Style map for text elements or nothing if inactive
 */
export const renderTextStyles = (
  hass: HomeAssistant,
  config: Config,
  state?: EntityState,
): DirectiveResult<typeof StyleMapDirective> | typeof nothing => {
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  if (skipStyles) return nothing;
  const styleData = getStyleData(hass, 'text', state);

  if (!styleData) return nothing;

  return styleData.active
    ? styleMap({
        '--text-color': styleData.cssColor,
        '--state-color-text-theme': styleData.themeOverride,
      })
    : nothing;
};
