import { html } from 'lit';

import type { EntityState, HomeAssistant } from './types';

export const createStateIcon = (
    hass: HomeAssistant,
    state: EntityState,
    classes: String[],
) =>
    html`<div class="${['icon', ...classes].join(' ')}">
        <ha-state-icon
            .hass=${hass}
            .stateObj=${state}
            .icon=${state.attributes.icon || 'mdi:help-circle'}
        ></ha-state-icon>
    </div>`;

// <div class="icon entity entity-${position}">
//         <ha-state-icon
//           .hass=${this._hass}
//           .stateObj=${state}
//           .icon=${state.attributes.icon || "mdi:help-circle"}
//           id="icon"
//         ></ha-state-icon>
//       </div>
