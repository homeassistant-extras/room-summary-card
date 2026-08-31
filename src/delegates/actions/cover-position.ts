import type { HomeAssistant } from '@homeassistant-extras/hass/types';

/**
 * Sets the position of a cover entity (0 = closed, 100 = open).
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string | undefined} entityId - The entity ID of the cover
 * @param {number} position - Position value (0-100)
 */
export const setCoverPosition = async (
  hass: HomeAssistant,
  entityId: string | undefined,
  position: number,
): Promise<void> => {
  if (!entityId) return;

  const clampedPosition = Math.max(0, Math.min(100, Math.round(position)));

  await hass.callService('cover', 'set_cover_position', {
    entity_id: entityId,
    position: clampedPosition,
  });
};
