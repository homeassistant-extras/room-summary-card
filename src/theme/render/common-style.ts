import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { getThemeColorOverride } from '@theme/custom-theme';
import type { EntityState } from '@type/config';

/**
 * Interface for common style data used by both icon and text styling functions
 */
interface StyleData {
  active: boolean;
  cssColor: string | undefined;
  themeOverride: string | undefined;
  activeClass: 'active' | 'inactive';
}

/**
 * Common function to generate style data from entity state
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} [state] - Current entity state
 * @returns {StyleData | null} Common style data or null if no state
 */
export const getStyleData = (
  hass: HomeAssistant,
  state?: EntityState,
): StyleData | null => {
  if (!state) return null;

  const stateObj = state as any as HassEntity;
  const active = stateActive(stateObj);
  const activeClass = active ? 'active' : 'inactive';
  const themeOverride = getThemeColorOverride(hass, state, active);
  const cssColor =
    stateColorCss(stateObj) ??
    (themeOverride ? 'var(--state-color-theme-override)' : undefined);

  return {
    active,
    cssColor,
    themeOverride,
    activeClass,
  };
};
