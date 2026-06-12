import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';

/**
 * Merges the card-level `config.actions` over an entity's own
 * tap/hold/double-tap configuration.
 *
 * Used for the info area (room name & stats), the `full_card_actions`
 * overlay, and the hidden icon box when `hide_room_icon` is enabled —
 * everywhere the "card body" actions apply. The visible room icon keeps
 * the entity's own actions so the split-tap pattern keeps working.
 *
 * @param entity - The entity whose action config is the base
 * @param config - The card configuration containing optional `actions`
 * @returns The entity with `config.actions` merged over its action config
 */
export const mergeActions = (
  entity: EntityInformation,
  config: Config,
): EntityInformation => ({
  ...entity,
  config: {
    ...entity.config,
    ...config.actions,
  },
});
