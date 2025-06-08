import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import type { ActionConfig } from '@hass/data/lovelace/config/action';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityInformation } from '@type/config';

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
  const actionConfig = {
    tap_action: {
      action: 'navigate',
      navigation_path: config.navigate ?? config.area.replace('_', '-'),
    } as ActionConfig,
    hold_action: { action: 'more-info' } as ActionConfig,
    double_tap_action: { action: 'none' } as ActionConfig,
  };

  // Handle different entity configuration formats
  if (config.entity) {
    if (typeof config.entity === 'string') {
      // String format
      return {
        config: {
          entity_id: config.entity,
          ...actionConfig,
        },
        state: getState(hass, config.entity),
      };
    } else {
      // Object format
      return {
        config: {
          ...actionConfig,
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
      icon: getArea(hass.areas, config.area)?.icon,
      ...actionConfig,
    },
    state: getState(hass, roomEntityId, true),
  };
};
