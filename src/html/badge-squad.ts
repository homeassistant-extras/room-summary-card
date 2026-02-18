import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { html, type TemplateResult } from 'lit';

/**
 * Renders badge elements for an entity.
 * Limits badges to a maximum of 4.
 * Ensures each badge has entity_id (from user config or parent entity).
 *
 * @param entity - The entity information (used for entity_id and entityConfig)
 * @param hass - Home Assistant instance
 * @param config - Card config for debug (optional)
 * @returns Array of badge template results
 */
export const renderBadgeElements = (
  entity: EntityInformation,
  hass: HomeAssistant,
  config?: Config,
): TemplateResult[] | undefined =>
  entity.config.badges?.slice(0, 4)?.map((badge) => {
    return html`
      <room-badge
        .cardConfig=${config}
        .config=${{
          ...badge,
          entity_id: badge.entity_id ?? entity.config.entity_id,
        }}
        .hass=${hass}
      ></room-badge>
    `;
  });
