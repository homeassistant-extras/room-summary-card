/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/tile/badges/tile-badge-person.ts
 */

import { stateColorCss } from '@hass/common/entity/state_color';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { RenderBadgeFunction } from './tile-badge';

function getZone(entity: HassEntity, hass: HomeAssistant) {
  const state = entity.state;
  if (state === 'home' || state === 'not_home') return undefined;

  const zones = Object.values(hass.states).filter((stateObj) =>
    stateObj.entity_id.startsWith('zone.'),
  );

  return zones.find((z) => state === z.attributes.friendly_name);
}

export const renderPersonBadge: RenderBadgeFunction = (stateObj, hass) => {
  const zone = getZone(stateObj, hass);

  const zoneIcon = zone?.attributes.icon;

  const color = stateColorCss(stateObj, 'badge');

  if (zoneIcon) {
    return html`
      <ha-tile-badge
        style=${styleMap({
          '--tile-badge-background-color': color || 'var(--primary-color)',
        })}
      >
        <ha-icon .icon=${zoneIcon}></ha-icon>
      </ha-tile-badge>
    `;
  }

  // Use icon strings instead of importing from @mdi/js
  const defaultIcon =
    stateObj.state === 'not_home' ? 'mdi:home-export-outline' : 'mdi:home';

  return html`
    <ha-tile-badge
      style=${styleMap({
        '--tile-badge-background-color': color || 'var(--primary-color)',
      })}
    >
      <ha-icon .icon=${defaultIcon}></ha-icon>
    </ha-tile-badge>
  `;
};
