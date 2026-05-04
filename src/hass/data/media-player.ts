/**
 * Ported from Home Assistant frontend (`setMediaPlayerVolume` only).
 *
 * @see https://github.com/home-assistant/frontend/blob/dev/src/data/media-player.ts
 */

import type { HomeAssistant } from '@hass/types';

/**
 * Set volume of a media player entity.
 * @param hass Home Assistant object
 * @param entity_id entity ID of media player
 * @param volume_level number between 0..1
 */
export const setMediaPlayerVolume = (
  hass: HomeAssistant,
  entity_id: string,
  volume_level: number,
) =>
  hass.callService('media_player', 'volume_set', { entity_id, volume_level });
