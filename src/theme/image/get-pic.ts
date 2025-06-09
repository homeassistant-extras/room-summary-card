import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';

/**
 * Determines the background image URL from various sources
 */
export const getBackgroundImageUrl = (
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
