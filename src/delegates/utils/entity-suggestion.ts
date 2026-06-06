import { getDevice } from '@delegates/retrievers/device';
import { getEntity } from '@delegates/retrievers/entity';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';

/**
 * A single card-picker suggestion offered for an entity.
 *
 * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#suggesting-your-card-for-an-entity
 */
export interface CardSuggestion {
  /** Short label describing the variant (shown in the picker). */
  label: string;
  /** Card configuration applied if the user picks the suggestion. */
  config: Record<string, unknown>;
}

/**
 * Suggests the room summary card for an entity in Home Assistant's card picker.
 *
 * The card is area-based, so a suggestion is only offered when the entity (or
 * its device) resolves to an area. Two variants are returned: the room summary
 * for the area, and the same with the picked entity featured as the main room
 * entity.
 *
 * @param {HomeAssistant} hass - The Home Assistant object
 * @param {string} entityId - The entity selected in the card picker
 * @returns {CardSuggestion[] | null} Suggestions, or `null` if unsupported
 */
export const getEntitySuggestion = (
  hass: HomeAssistant,
  entityId: string,
): CardSuggestion[] | null => {
  const entity = getEntity(hass.entities, entityId);
  if (!entity) {
    return null;
  }

  const device = entity.device_id
    ? getDevice(hass.devices, entity.device_id)
    : undefined;
  const area = entity.area_id ?? device?.area_id;
  if (!area) {
    return null;
  }

  return [
    {
      label: 'Room summary',
      config: { type: 'custom:room-summary-card', area },
    },
    {
      label: 'Room summary with featured entity',
      config: { type: 'custom:room-summary-card', area, entity: entityId },
    },
  ];
};
