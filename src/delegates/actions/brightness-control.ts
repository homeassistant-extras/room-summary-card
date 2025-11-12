import type { HomeAssistant } from '@hass/types';

/**
 * Sets the brightness of a light entity
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string | undefined} entityId - The entity ID of the light
 * @param {number} brightness - Brightness value (0-255)
 */
export const setBrightness = async (
  hass: HomeAssistant,
  entityId: string | undefined,
  brightness: number,
): Promise<void> => {
  if (!entityId) return;

  // Ensure brightness is within valid range
  const clampedBrightness = Math.max(0, Math.min(255, Math.round(brightness)));

  // If brightness is 0, turn off the light
  if (clampedBrightness === 0) {
    await hass.callService('light', 'turn_off', {
      entity_id: entityId,
    });
    return;
  }

  // Otherwise, turn on the light with the specified brightness
  await hass.callService('light', 'turn_on', {
    entity_id: entityId,
    brightness: clampedBrightness,
  });
};
