import { type TemplateResult, html } from 'lit';

import { createStateStyles } from './styles';
import type { Area, Device, Entity, HomeAssistant, State } from './types';

export const createStateIcon = (
    hass: HomeAssistant,
    state: State,
    classes: String[],
    icon: string | undefined = undefined,
): TemplateResult => {
    const { iconStyle, iconDivStyle } = createStateStyles(state);

    return html`<div
        class="${['icon', ...classes].join(' ')}"
        style=${iconDivStyle}
    >
        <ha-state-icon
            .hass=${hass}
            .icon="${icon}"
            .stateObj=${state}
            style=${iconStyle}
        ></ha-state-icon>
    </div>`;
};

export const getState = (hass: HomeAssistant, entityId: string): State =>
    (hass.states as { [key: string]: any })[entityId];

export const getEntity = (hass: HomeAssistant, entityId: string): Entity =>
    (hass.entities as { [key: string]: any })[entityId];

export const getDevice = (hass: HomeAssistant, deviceId: string): Device =>
    (hass.devices as { [key: string]: any })[deviceId];

export const getArea = (hass: HomeAssistant, deviceId: string): Area =>
    (hass.areas as { [key: string]: any })[deviceId];
