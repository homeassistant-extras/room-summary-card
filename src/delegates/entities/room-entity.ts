import { hasFeature } from '@config/feature';
import { getArea } from '@delegates/retrievers/area';
import { getState } from '@delegates/retrievers/state';
import type { ActionConfig } from '@hass/data/lovelace/config/action';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';

/**
 * Checks if a string is a URL (starts with http:// or https://)
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a URL
 */
const isUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://');
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

  // Determine the navigation target
  const navigationTarget = config.navigate ?? config.area.replace('_', '-');

  // Create appropriate action based on whether the target is a URL or path
  const tapAction: ActionConfig = isUrl(navigationTarget)
    ? {
        action: 'url',
        url_path: navigationTarget,
      }
    : {
        action: 'navigate',
        navigation_path: navigationTarget,
      };

  const actionConfig = {
    tap_action: tapAction,
    hold_action: { action: 'more-info' } as ActionConfig,
    double_tap_action: { action: 'none' } as ActionConfig,
  };

  // Handle different entity configuration formats
  if (config.entity && !hasFeature(config, 'ignore_entity')) {
    if (typeof config.entity === 'string') {
      // String format
      return {
        config: {
          entity_id: config.entity,
          ...actionConfig,
        },
        state: getState(hass.states, config.entity),
      };
    } else {
      // Object format
      return {
        config: {
          ...actionConfig,
          ...config.entity,
        },
        state: getState(hass.states, config.entity.entity_id),
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
    state: getState(hass.states, roomEntityId, true),
  };
};
