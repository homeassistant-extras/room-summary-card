/**
 * Subscribe to entity state changes via Home Assistant's subscribe_trigger API.
 * Only receives events when the specified entity changes (server-side filtering).
 *
 * @see https://developers.home-assistant.io/docs/api/websocket#subscribe_trigger
 */

import type { HomeAssistant } from '@hass/types';
import type { SubscriptionUnsubscribe } from '@hass/ws/types';

export interface StateTriggerResult {
  variables: { trigger: Record<string, unknown> };
  context: { id: string; parent_id: string | null; user_id: string | null };
}

/**
 * Subscribe to state changes for a single entity.
 * Returns a Promise that resolves to the unsubscribe function.
 */
export const subscribeEntityState = (
  hass: HomeAssistant,
  entityId: string,
  onChange: (result: StateTriggerResult) => void,
): Promise<SubscriptionUnsubscribe> =>
  hass.connection.subscribeMessage(onChange, {
    type: 'subscribe_trigger',
    trigger: { platform: 'state', entity_id: entityId },
  });
