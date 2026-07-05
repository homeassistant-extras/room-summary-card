import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import { computeDomain } from '@homeassistant-extras/hass/common/entity/compute_domain';
import type { LovelaceElementConfig } from '@homeassistant-extras/hass/panels/lovelace/elements/types';
import { HOLD_AND_DOUBLE_TAP_NONE } from '@homeassistant-extras/hass/render/constants';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Config } from '@type/config';

/**
 * Config for HA's `hui-image-element` (type: image).
 *
 * Mirrors the fields of `ImageElementConfig` in the HA frontend that we use;
 * the vendored `LovelaceElementConfig` only carries the base fields.
 */
export interface ImageElementConfig extends LovelaceElementConfig {
  image?:
    | string
    | {
        media_content_id: string;
        media_content_type?: string;
        metadata?: Record<string, unknown>;
      };
  image_entity?: string;
  camera_image?: string;
  camera_view?: 'auto' | 'live';
}

/** Base config shared by all mapped images - never trigger more-info. */
const base = {
  type: 'image',
  tap_action: { action: 'none' as const },
  ...HOLD_AND_DOUBLE_TAP_NONE,
};

/**
 * Maps the card's `background` config (plus area picture fallback) to an
 * `ImageElementConfig` consumed by HA's `hui-image-element`.
 *
 * HA then owns the image lifecycle: media-source resolution, `image.*`
 * entity URLs, camera thumbnails with periodic refresh, and load states.
 *
 * Priority: `image_entity` → `background.image` → area `picture`.
 *
 * @returns The mapped config, or `undefined` when no background applies.
 */
export const backgroundToHuiConfig = (
  hass: HomeAssistant,
  config: Config,
): ImageElementConfig | undefined => {
  // user has explicitly disabled the background
  if (config.background?.options?.includes('disable')) return undefined;

  // Check entity picture first
  const imageEntity = config.background?.image_entity;
  if (imageEntity) {
    const domain = computeDomain(imageEntity);
    if (domain === 'camera') {
      return { ...base, camera_image: imageEntity, camera_view: 'auto' };
    }
    if (domain === 'image') {
      return { ...base, image_entity: imageEntity };
    }

    // person (or any other domain): single sync read of entity_picture
    const entityPicture = getState(hass.states, imageEntity)?.attributes
      ?.entity_picture;
    if (typeof entityPicture === 'string') {
      return { ...base, image: entityPicture };
    }
  }

  // Check config image
  if (config.background?.image) {
    return { ...base, image: config.background.image };
  }

  // Fallback to area picture
  const areaPicture = getArea(hass.areas, config.area)?.picture;
  return areaPicture ? { ...base, image: areaPicture } : undefined;
};
