/**
 * https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/tile/badges/tile-badge-humidifier.ts
 */

import { stateColorCss } from '@hass/common/entity/state_color';
import type { HumidifierEntity } from '@hass/data/humidifier';
import { HUMIDIFIER_ACTION_MODE } from '@hass/data/humidifier';
import { html, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import type { RenderBadgeFunction } from './tile-badge';

export const renderHumidifierBadge: RenderBadgeFunction = (stateObj, hass) => {
  const action = (stateObj as HumidifierEntity).attributes.action;

  if (!action || action === 'off') {
    return nothing;
  }

  // Adapt stateColorCss call - room-summary-card version has different signature
  const color = stateColorCss(
    stateObj,
    'badge', // scope
    undefined, // active
    HUMIDIFIER_ACTION_MODE[action], // state
  );

  return html`
    <ha-tile-badge
      style=${styleMap({
        '--tile-badge-background-color': color || 'var(--primary-color)',
      })}
    >
      <ha-attribute-icon .hass=${hass} .stateObj=${stateObj} attribute="action">
      </ha-attribute-icon>
    </ha-tile-badge>
  `;
};
