import { hasFeature } from '@config/feature';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';

/**
 * Calculates the opacity value for the background
 */
export const getBackgroundOpacity = (
  hass: HomeAssistant,
  config: Config,
  state?: EntityState,
) => {
  // Determine active state for default opacity
  const stateObj = state as any as HassEntity;
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const active = hass.themes.darkMode && stateActive(stateObj);

  const opacity = config.background?.opacity
    ? config.background.opacity / 100
    : undefined;

  return {
    '--opacity-theme': opacity,
    '--background-opacity-card': `var(--opacity-background-${active && !skipStyles ? 'active' : 'inactive'})`,
  };
};
