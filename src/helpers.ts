import { type TemplateResult, html } from 'lit';

import { actionHandler } from './action-handler';
import { doToggle, moreInfo } from './events';
import { createStateStyles } from './styles';
import type {
  ActionHandlerEvent,
  Area,
  Device,
  Entity,
  HomeAssistant,
  State,
} from './types';

export const createStateIcon = (
  element: HTMLElement,
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
      @action=${{
        handleEvent: (ev: ActionHandlerEvent) => {
          if (ev.detail?.action) {
            switch (ev.detail.action) {
              case 'tap':
                doToggle(hass, state.entity_id);
                break;
              case 'hold':
                moreInfo(element, state.entity_id);
                break;
              case 'double_tap':
              default:
                break;
            }
          }
        },
      }}
      .actionHandler=${actionHandler({
        hasDoubleClick: false,
        hasHold: true,
        disabled: false,
      })}
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
