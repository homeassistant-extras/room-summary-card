import { hasFeature } from '@config/feature';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityConfig, EntityInformation } from '@type/config';

const climateIcons = {
  auto: 'mdi:autorenew',
  cool: 'mdi:snowflake',
  heat: 'mdi:fire',
  dry: 'mdi:water',
  heat_cool: 'mdi:sun-snowflake',
  fan_only: 'mdi:fan',
  off: 'mdi:snowflake-off',
} as Record<string, string>;

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
  const entities = hasFeature(config, 'exclude_default_entities')
    ? configEntities
    : baseEntities.concat(configEntities);

  // Process and transform entities
  const states = entities
    .map((entity) => {
      // Transform string format to entity config for convenience
      if (typeof entity === 'string') {
        entity = { entity_id: entity };
      }

      const state = getState(hass.states, entity.entity_id);
      if (!state) return undefined;

      const useClimateIcons =
        !hasFeature(config, 'skip_climate_styles') &&
        state.domain === 'climate';

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
          attributes: {
            icon: useClimateIcons ? climateIcons[state.state] : undefined,
            ...state.attributes,
          },
        },
      } as EntityInformation;
    })
    .filter((entity): entity is EntityInformation => entity !== undefined);

  return states;
};
