import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import {
  isMediaSourceContentId,
  resolveMediaSource,
} from '@hass/data/media_source';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';

/**
 * Resolves a media source content ID or returns it as-is
 */
const resolveMediaContentId = async (
  hass: HomeAssistant,
  mediaContentId: string,
): Promise<string> => {
  if (isMediaSourceContentId(mediaContentId)) {
    return await resolveMediaSource(hass, mediaContentId);
  }
  return mediaContentId;
};

/**
 * Handles image configuration that can be a string or object
 */
const handleImageConfig = async (
  hass: HomeAssistant,
  image: string | { media_content_id: string },
): Promise<string> => {
  if (typeof image === 'string') {
    return await resolveMediaContentId(hass, image);
  }
  return await resolveMediaContentId(hass, image.media_content_id);
};

/**
 * Determines the background image URL from various sources
 * Supports both string URLs and media source objects
 */
export const getBackgroundImageUrl = async (
  hass: HomeAssistant,
  config: Config,
): Promise<string | undefined | null> => {
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
    return await handleImageConfig(hass, config.background.image);
  }

  // Fallback to area picture
  const area = getArea(hass.areas, config.area);
  return area?.picture;
};
