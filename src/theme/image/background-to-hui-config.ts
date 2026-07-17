import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Config } from '@type/config';

/**
 * The subset of HA's `hui-image` properties we drive. Everything else
 * (media-source resolution, camera thumbnail refresh, load/error states)
 * is handled inside `hui-image` itself.
 */
export interface HuiImageConfig {
  /** Static URL, `media-source://` content id, or entity picture */
  image?: string;
  /** Camera entity for thumbnail polling / live view */
  camera_image?: string;
  camera_view?: 'auto' | 'live';
}

/**
 * Maps the card's `background` config (plus area picture fallback) to a
 * `hui-image` configuration.
 *
 * Priority matches the legacy resolver: `image_entity` → `background.image`
 * → area picture. Returns `undefined` when backgrounds are disabled or no
 * image source is configured.
 */
export const getHuiImageConfig = (
  hass: HomeAssistant,
  config: Config,
): HuiImageConfig | undefined => {
  if (config.background?.options?.includes('disable')) return undefined;

  const entityId = config.background?.image_entity;
  if (entityId) {
    if (computeDomain(entityId) === 'camera') {
      return { camera_image: entityId, camera_view: 'auto' };
    }

    // image.* / person.* / anything with an entity picture
    const picture = getState(hass.states, entityId)?.attributes?.entity_picture;
    if (typeof picture === 'string') {
      return { image: picture };
    }
  }

  const image = config.background?.image;
  if (image) {
    return {
      image: typeof image === 'string' ? image : image.media_content_id,
    };
  }

  const areaPicture = getArea(hass.areas, config.area)?.picture;
  return areaPicture ? { image: areaPicture } : undefined;
};
