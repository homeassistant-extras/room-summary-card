import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import {
  isMediaSourceContentId,
  resolveMediaSource,
} from '@hass/data/media_source';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';

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
    const image = config.background.image;

    // Handle object format (media source)
    if (typeof image === 'object' && image.media_content_id) {
      const mediaContentId = image.media_content_id;
      // If it's a media source, resolve it via WebSocket
      if (isMediaSourceContentId(mediaContentId)) {
        return await resolveMediaSource(hass, mediaContentId);
      }
      // Otherwise, return the media_content_id as-is (backwards compatibility)
      return mediaContentId;
    }

    // Handle string format
    if (typeof image === 'string') {
      // If it's a media source string, resolve it via WebSocket
      if (isMediaSourceContentId(image)) {
        return await resolveMediaSource(hass, image);
      }
      // Otherwise, return the string as-is (backwards compatibility)
      return image;
    }
  }

  // Fallback to area picture
  const area = getArea(hass.areas, config.area);
  return area?.picture;
};
