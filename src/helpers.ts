/**
 * Home Assistant Helper Functions
 *
 * A collection of utility functions for working with Home Assistant entities,
 * states, and configurations. These functions handle entity management,
 * state retrieval, and UI element creation.
 */

import { feature } from '@common/feature';
import type { Config, EntityConfig, EntityInformation } from '@type/config';
import type {
  Area,
  Device,
  Entity,
  HomeAssistant,
  State,
} from '@type/homeassistant';
import { getClimateStyles } from './styles';

/**
 * Retrieves the state of an entity
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} [entityId] - The ID of the entity
 * @param {boolean} [fakeState=false] - Whether to create a fake state if none exists
 * @returns {State | undefined} The entity's state or undefined
 */
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

  return {
    ...state,
    getDomain: () => state.entity_id.split('.')[0],
    isActive: () =>
      ['on', 'true'].includes(state.state?.toLowerCase()) ||
      Number(state.state) > 0,
  };
};

/**
 * Retrieves entity information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} entityId - The ID of the entity
 * @returns {Entity} The entity information
 */
export const getEntity = (hass: HomeAssistant, entityId: string): Entity =>
  (hass.entities as { [key: string]: any })[entityId];

/**
 * Retrieves device information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} deviceId - The ID of the device
 * @returns {Device} The device information
 */
export const getDevice = (hass: HomeAssistant, deviceId: string): Device =>
  (hass.devices as { [key: string]: any })[deviceId];

/**
 * Retrieves area information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} deviceId - The ID of the device
 * @returns {Area | undefined} The area information
 */
export const getArea = (
  hass: HomeAssistant,
  deviceId: string,
): Area | undefined => (hass.areas as { [key: string]: any })[deviceId];

/**
 * Gets entities with problems in a specific area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {string} area - The area to check for problems
 * @returns {Object} Object containing problem entities and existence flag
 */
export const getProblemEntities = (
  hass: HomeAssistant,
  area: string,
): {
  problemEntities: string[];
  problemExists: boolean;
} => {
  // Find entities labeled as problems in the specified area
  const problemEntities = Object.keys(hass.entities).filter((entityId) => {
    const entity = hass.entities[entityId];
    if (!entity?.labels?.includes('problem')) return false;

    const device = hass.devices?.[entity.device_id];
    return [entity.area_id, device?.area_id].includes(area);
  });

  // Check if any problem entities are currently active
  const problemExists = problemEntities.some((entityId) => {
    const entityState = getState(hass, entityId);
    if (!entityState) return false;
    return entityState.isActive();
  });

  return {
    problemEntities,
    problemExists,
  };
};

/**
 * Gets entities to display icons for
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {EntityInformation[]} Array of configured entities
 */
export const getIconEntities = (
  hass: HomeAssistant,
  config: Config,
): EntityInformation[] => {
  // Define base entities for the area
  const baseEntities = [
    `light.${config.area}_light`,
    `switch.${config.area}_fan`,
  ] as (EntityConfig | string)[];

  const configEntities = config.entities || [];

  // Combine base and config entities unless fan is removed
  const entities = feature(config, 'exclude_default_entities')
    ? configEntities
    : baseEntities.concat(configEntities);

  // Process and transform entities
  const states = entities
    .map((entity) => {
      // Transform string format to entity config
      if (typeof entity === 'string') {
        entity = { entity_id: entity };
      }

      const state = getState(hass, entity.entity_id);
      if (!state) return undefined;

      const useClimateColors =
        !config.skip_climate_colors && state.getDomain() === 'climate';

      const { climateStyles, climateIcons } = getClimateStyles();

      // Create entity information with defaults and climate handling
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
    .filter((entity): entity is EntityInformation => entity !== undefined);

  return states;
};

/**
 * Gets the room entity information
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {EntityInformation} The room entity information
 */
export const getRoomEntity = (
  hass: HomeAssistant,
  config: Config,
): EntityInformation => {
  const roomEntityId = `light.${config.area}_light`;

  // Handle different entity configuration formats
  if (config.entity) {
    if (typeof config.entity === 'string') {
      // String format
      return {
        config: {
          entity_id: config.entity,
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
        },
        state: getState(hass, config.entity),
      };
    } else {
      // Object format
      return {
        config: {
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
          ...config.entity,
        },
        state: getState(hass, config.entity.entity_id),
      };
    }
  }

  // Default room light configuration
  return {
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
    state: getState(hass, roomEntityId, true),
  };
};
