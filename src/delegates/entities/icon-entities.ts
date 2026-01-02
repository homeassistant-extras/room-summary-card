import { hasFeature } from '@config/feature';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { EntityInformation } from '@type/room';

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
  // Support both naming conventions: light.{area}_light / light.{area} and switch.{area}_fan / fan.{area}
  const baseEntities = [
    `light.${config.area}_light`,
    `light.${config.area}`,
    `switch.${config.area}_fan`,
    `fan.${config.area}`,
  ] as (EntityConfig | string)[];

  const configEntities = config.entities || [];

  // Combine base and config entities unless fan is removed
  const entities = hasFeature(config, 'exclude_default_entities')
    ? configEntities
    : baseEntities.concat(configEntities);

  const stickyEntitiesEnabled = hasFeature(config, 'sticky_entities');
  const hideHiddenEntities = hasFeature(config, 'hide_hidden_entities');

  // Process and transform entities
  const states = entities
    .map((entity) => {
      // Transform string format to entity config for convenience
      if (typeof entity === 'string') {
        entity = { entity_id: entity };
      }

      // Skip hidden entities if the feature is enabled
      if (hideHiddenEntities && hass.entities[entity.entity_id]?.hidden) {
        return undefined;
      }

      const state = getState(hass.states, entity.entity_id);
      const isBaseEntity = (baseEntities as string[]).includes(
        entity.entity_id,
      );

      // If state is not found:
      // - For base entities: always return undefined (don't apply sticky entities)
      // - For config entities: apply sticky entities logic if enabled
      if (!state) {
        if (isBaseEntity || !stickyEntitiesEnabled) {
          return undefined;
        }

        // Return entity with undefined state for sticky entities (user-defined only)
        return {
          config: entity,
          state: undefined,
        } as EntityInformation;
      }

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
