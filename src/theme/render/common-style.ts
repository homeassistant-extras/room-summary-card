import { stateActive } from '@hass/common/entity/state_active';
import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { getThemeColorOverride } from '@theme/custom-theme';
import type { EntityInformation } from '@type/room';

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
 * Retrieves style-related data for a given entity within a specified scope.
 *
 * This function determines the active state, CSS color, theme override, and active class
 * for the provided entity, based on its current state and the Home Assistant context.
 *
 * @param hass - The Home Assistant instance containing configuration and theme information.
 * @param scope - The style scope or context (e.g., 'primary', 'secondary') for which to retrieve style data.
 * @param entity - The entity information object, including its current state.
 * @returns An object containing style data (`active`, `cssColor`, `themeOverride`, `activeClass`),
 *          or `null` if the entity state is not available.
 */
export const getStyleData = (
  hass: HomeAssistant,
  scope: string,
  entity: EntityInformation,
): StyleData | null => {
  const { state } = entity;
  if (!state) return null;

  const stateObj = state as any as HassEntity;
  const active = stateActive(stateObj);
  const activeClass = active ? 'active' : 'inactive';
  const themeOverride = getThemeColorOverride(hass, entity, active);
  const cssColor =
    stateColorCss(stateObj, scope) ??
    (themeOverride ? `var(--state-color-${scope}-theme)` : undefined);

  return {
    active,
    cssColor,
    themeOverride,
    activeClass,
  };
};
