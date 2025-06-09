import { hasFeature } from '@config/feature';
import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config, EntityState } from '@type/config';

/**
 * Determines the background image URL from various sources
 */
const getBackgroundImageUrl = (
  hass: HomeAssistant,
  config: Config,
): string | undefined | null => {
  const disableImage = config.background?.options?.includes('disable');
  if (disableImage) return undefined;

  // Check entity picture first
  if (config.background?.image_entity) {
    const entityState = getState(hass.states, config.background.image_entity);
    if (entityState?.attributes?.entity_picture) {
      return entityState.attributes.entity_picture;
    }
  }

  // Check config image
  if (config.background?.image) {
    return config.background.image;
  }

  // Fallback to area picture
  const area = getArea(hass.areas, config.area);
  return area?.picture;
};

/**
 * Calculates the opacity value for the background
 */
const getBackgroundOpacity = (
  hass: HomeAssistant,
  config: Config,
  imageUrl: string | undefined | null,
  state?: EntityState,
): string | number => {
  // Use custom opacity if configured or if there's an image
  if (imageUrl || config.background?.opacity) {
    return (config.background?.opacity ?? 20) / 100;
  }

  // Determine active state for default opacity
  const stateObj = state as any as HassEntity;
  const skipStyles = hasFeature(config, 'skip_entity_styles');
  const active = hass.themes.darkMode && stateActive(stateObj);

  return `var(--opacity-background-${active && !skipStyles ? 'active' : 'inactive'})`;
};

/**
 * Generates dynamic card styles based on state and sensor readings
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - Configuration object
 * @param {EntityState} [state] - Current entity state
 * @returns {Object} Background image configuration
 */
export const backgroundImage = (
  hass: HomeAssistant,
  config: Config,
  state?: EntityState,
) => {
  const imageUrl = getBackgroundImageUrl(hass, config);

  return {
    image: imageUrl ? `url(${imageUrl})` : undefined,
    opacity: getBackgroundOpacity(hass, config, imageUrl, state),
  };
};
