/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/media_source.ts
 */

import type { HomeAssistant } from '../types';

export interface ResolvedMediaSource {
  url: string;
  mime_type: string;
}

/**
 * Checks if a string is a media source content ID
 */
export const isMediaSourceContentId = (mediaId: string): boolean =>
  mediaId.startsWith('media-source://');

/**
 * Resolves a media source content ID to a URL via WebSocket
 */
export const resolveMediaSource = async (
  hass: HomeAssistant,
  mediaContentId: string,
): Promise<string> => {
  const result = await hass.callWS<ResolvedMediaSource>({
    type: 'media_source/resolve_media',
    media_content_id: mediaContentId,
  });
  return result.url;
};


