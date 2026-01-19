/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/tile/badges/tile-badge-climate.ts
 */

import { stateColorCss } from '@hass/common/entity/state_color';
import type { ClimateEntity } from '@hass/data/climate';
import { CLIMATE_HVAC_ACTION_TO_MODE } from '@hass/data/climate';
import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { RenderBadgeFunction } from './tile-badge';

export const renderClimateBadge: RenderBadgeFunction = (stateObj, hass) => {
  const hvacAction = (stateObj as ClimateEntity).attributes.hvac_action;

  if (!hvacAction || hvacAction === 'off') {
    return nothing;
  }

  // Adapt stateColorCss call - room-summary-card version has different signature
  const color = stateColorCss(
    stateObj,
    'badge', // scope
    undefined, // active
    CLIMATE_HVAC_ACTION_TO_MODE[hvacAction], // state
  );

  return html`
    <ha-tile-badge
      style=${styleMap({
        '--tile-badge-background-color': color || 'var(--primary-color)',
      })}
    >
      <ha-attribute-icon
        .hass=${hass}
        .stateObj=${stateObj}
        attribute="hvac_action"
      >
      </ha-attribute-icon>
    </ha-tile-badge>
  `;
};
