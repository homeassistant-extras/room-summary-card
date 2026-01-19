import type { HomeAssistant } from '@hass/types';
import type { BadgeConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';
import { html, type TemplateResult } from 'lit';

/**
 * Renders badge elements for an entity.
 * Limits badges to a maximum of 4.
 *
 * @param badges - Array of badge configurations (will be limited to first 4)
 * @param entity - The entity information
 * @param hass - Home Assistant instance
 * @returns Array of badge template results
 */
export const renderBadgeElements = (
  badges: BadgeConfig[] | undefined,
  entity: EntityInformation,
  hass: HomeAssistant,
): TemplateResult[] => {
  const badgeConfigs = badges?.slice(0, 4) ?? [];
  return badgeConfigs.map(
    (badge) => html`
      <room-badge .config=${badge} .entity=${entity} .hass=${hass}></room-badge>
    `,
  );
};
