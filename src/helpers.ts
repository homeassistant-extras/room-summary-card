import { html } from 'lit';

import type { Device, Entity, HomeAssistant, State } from './types';

export const createStateIcon = (
    hass: HomeAssistant,
    state: State,
    classes: String[],
) =>
    html`<div class="${['icon', ...classes].join(' ')}">
        <ha-state-icon .hass=${hass} .stateObj=${state}></ha-state-icon>
    </div>`;

export const getState = (hass: HomeAssistant, entityId: string): State =>
    (hass.states as { [key: string]: any })[entityId];

export const getEntity = (hass: HomeAssistant, entityId: string): Entity =>
    (hass.entities as { [key: string]: any })[entityId];

export const getDevice = (hass: HomeAssistant, deviceId: string): Device =>
    (hass.devices as { [key: string]: any })[deviceId];
