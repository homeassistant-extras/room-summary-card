import { type TemplateResult, html } from 'lit';

import { actionHandler } from './action-handler';
import { doToggle, moreInfo } from './events';
import { createStateStyles } from './styles';
import type {
  ActionHandlerEvent,
  Area,
  Device,
  Entity,
  EntityInformation,
  HomeAssistant,
  State,
} from './types';

export const createStateIcon = (
  element: HTMLElement,
  hass: HomeAssistant,
  entity: EntityInformation,
  classes: String[],
): TemplateResult => {
  const { state } = entity;
  const { iconStyle, iconContainerStyle } = createStateStyles(state);

  return html`<div
    class="${['icon', ...classes].join(' ')}"
    style=${iconContainerStyle}
  >
    <ha-state-icon
      .hass=${hass}
      .stateObj=${state}
      style=${iconStyle}
      @action=${{
        handleEvent: (ev: ActionHandlerEvent) => {
          if (ev.detail?.action) {
            switch (ev.detail.action) {
              case 'tap':
                switch (entity.config.tap_action?.action) {
                  case 'navigate':
                    window.location.href =
                      entity.config.tap_action.navigation_path;
                    break;
                  case 'toggle':
                  default:
                    doToggle(hass, state);
                    break;
                }
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

export const getState = (hass: HomeAssistant, entityId: string): State => {
  const state = (hass.states as { [key: string]: any })[entityId];
  return { ...state, getDomain: () => state.entity_id.split('.')[0] };
};

export const getEntity = (hass: HomeAssistant, entityId: string): Entity =>
  (hass.entities as { [key: string]: any })[entityId];

export const getDevice = (hass: HomeAssistant, deviceId: string): Device =>
  (hass.devices as { [key: string]: any })[deviceId];

export const getArea = (hass: HomeAssistant, deviceId: string): Area =>
  (hass.areas as { [key: string]: any })[deviceId];
