import { type TemplateResult, html } from 'lit';

import { actionHandler } from './action-handler';
import { handleClickAction } from './handle-action';
import { getClimateStyles, getEntityIconStyles } from './styles';
import type {
  Area,
  Config,
  Device,
  Entity,
  EntityConfig,
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
  if (!state) return html``;

  const { iconStyle, iconContainerStyle } = getEntityIconStyles(state);

  return html`<div
    class="${['icon', ...classes].join(' ')}"
    style=${iconContainerStyle}
  >
    <ha-state-icon
      .hass=${hass}
      .stateObj=${state}
      .icon=${entity.config.icon}
      style=${iconStyle}
      @action=${handleClickAction(element, entity)}
      .actionHandler=${actionHandler(entity)}
    ></ha-state-icon>
  </div>`;
};

export const getState = (
  hass: HomeAssistant,
  entityId?: string,
  fakeState: boolean = false,
): State | undefined => {
  if (!entityId) return undefined;
  const state =
    (hass.states as { [key: string]: any })[entityId] ||
    (fakeState ? { entity_id: entityId } : undefined);
  if (!state) return undefined;
  return { ...state, getDomain: () => state.entity_id.split('.')[0] };
};

export const getEntity = (hass: HomeAssistant, entityId: string): Entity =>
  (hass.entities as { [key: string]: any })[entityId];

export const getDevice = (hass: HomeAssistant, deviceId: string): Device =>
  (hass.devices as { [key: string]: any })[deviceId];

export const getArea = (
  hass: HomeAssistant,
  deviceId: string,
): Area | undefined => (hass.areas as { [key: string]: any })[deviceId];

export const getProblemEntities = (
  hass: HomeAssistant,
  area: string,
): {
  problemEntities: string[];
  problemExists: boolean;
} => {
  const problemEntities = Object.keys(hass.entities).filter((entityId) => {
    const entity = hass.entities[entityId];
    if (!entity?.labels?.includes('problem')) return false;

    const device = hass.devices?.[entity.device_id];
    return [entity.area_id, device?.area_id].includes(area);
  });

  const problemExists = problemEntities.some((entityId) => {
    const entityState = hass.states[entityId];
    if (!entityState) return false;
    return entityState.state === 'on' || Number(entityState.state) > 0;
  });

  return {
    problemEntities,
    problemExists,
  };
};

export const getIconEntities = (hass: HomeAssistant, config: Config) => {
  const baseEntities = [
    `light.${config.area}_light`,
    `switch.${config.area}_fan`,
  ] as (EntityConfig | string)[];

  const configEntities = config.entities || [];

  const entities = config.remove_fan
    ? configEntities
    : baseEntities.concat(configEntities);

  const states = entities
    .map((entity) => {
      // handle the convenience string format
      if (typeof entity === 'string') {
        entity = { entity_id: entity };
      }

      const state = getState(hass, entity.entity_id);
      if (!state) return undefined;
      const useClimateColors =
        !config.skip_climate_colors && state.getDomain() === 'climate';

      const { climateStyles, climateIcons } = getClimateStyles();

      return {
        config: {
          tap_action: { action: 'toggle' },
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
          ...entity,
        } as EntityConfig,
        state: {
          ...state,
          state: useClimateColors ? 'on' : state.state,
          attributes: {
            icon: useClimateColors ? climateIcons[state.state] : undefined,
            on_color: useClimateColors ? climateStyles[state.state] : undefined,
            ...state.attributes,
          },
        },
      } as EntityInformation;
    })
    .filter((entity) => entity !== undefined);
  return states;
};

export const getRoomEntity = (hass: HomeAssistant, config: Config) => {
  const roomEntityId = `light.${config.area}_light`;
  const roomEntity: EntityInformation | undefined = config.entity
    ? typeof config.entity === 'string'
      ? // convenience transform - use their entity
        {
          config: {
            entity_id: config.entity,
            hold_action: { action: 'more-info' },
            double_tap_action: { action: 'none' },
          },
          state: getState(hass, config.entity),
        }
      : {
          config: {
            hold_action: { action: 'more-info' },
            double_tap_action: { action: 'none' },
            ...config.entity,
          },
          state: getState(hass, config.entity.entity_id),
        }
    : // else use the room light
      {
        config: {
          entity_id: roomEntityId,
          icon: getArea(hass, config.area)?.icon,
          tap_action: {
            action: 'navigate',
            navigation_path: config.navigate ?? config.area.replace('_', '-'),
          },
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
        } as EntityConfig,
        // fake state in case room entity doesn't exist
        state: getState(hass, roomEntityId, true),
      };
  return roomEntity;
};
