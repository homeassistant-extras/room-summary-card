/**
 * Ported from Home Assistant frontend (`setValue` only).
 *
 * @see https://github.com/home-assistant/frontend/blob/dev/src/data/input_text.ts
 */

import type { HomeAssistant } from '@hass/types';

export const setValue = (hass: HomeAssistant, entity: string, value: string) =>
  hass.callService(entity.split('.', 1)[0] ?? '', 'set_value', {
    value,
    entity_id: entity,
  });
