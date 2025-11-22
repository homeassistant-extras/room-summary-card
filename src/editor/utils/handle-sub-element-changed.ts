/**
 * @file Sub-element Change Handler Utilities
 * @description Utility functions for handling sub-element configuration changes in the editor.
 */

import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { SensorConfig } from '@type/config/sensor';

/**
 * Result of handling a sub-element change
 */
export interface SubElementChangeResult {
  /** Updated configuration */
  config: Config;
  /** Whether to go back to the main editor */
  shouldGoBack: boolean;
}

/**
 * Normalizes a value to either a string or EntityConfig
 */
function normalizeEntityValue(
  value: EntityConfig | string | null | undefined,
): EntityConfig | string | undefined {
  if (!value) {
    return undefined;
  }
  return typeof value === 'string' ? value : value;
}

/**
 * Handles update for single entity field (tab 0)
 */
export function handleSingleEntityUpdate(
  config: Config,
  value: EntityConfig | string | null | undefined,
): SubElementChangeResult {
  if (!value) {
    return {
      config: { ...config, entity: undefined },
      shouldGoBack: true,
    };
  }

  const normalizedValue = normalizeEntityValue(value);
  return {
    config: {
      ...config,
      entity: normalizedValue,
    },
    shouldGoBack: false,
  };
}

/**
 * Handles update for entities array (tab 1)
 */
export function handleEntitiesArrayUpdate(
  config: Config,
  value: EntityConfig | string | null | undefined,
  index: number,
): SubElementChangeResult {
  const newConfigEntities = (config.entities || []).concat();

  if (!value) {
    newConfigEntities.splice(index, 1);
    return {
      config: { ...config, entities: newConfigEntities },
      shouldGoBack: true,
    };
  }

  const normalizedValue = normalizeEntityValue(value);
  newConfigEntities[index] = normalizedValue as EntityConfig | string;

  return {
    config: { ...config, entities: newConfigEntities },
    shouldGoBack: false,
  };
}

/**
 * Handles update for sensors array (tab 3)
 */
export function handleSensorsArrayUpdate(
  config: Config,
  value: EntityConfig | string | null | undefined,
  index: number,
): SubElementChangeResult {
  const newConfigSensors = (config.sensors || []).concat();

  if (!value) {
    newConfigSensors.splice(index, 1);
    return {
      config: { ...config, sensors: newConfigSensors },
      shouldGoBack: true,
    };
  }

  // Sensors can be strings or SensorConfig (which extends BaseEntityConfig)
  const normalizedValue =
    typeof value === 'string' ? value : (value as SensorConfig);
  newConfigSensors[index] = normalizedValue;

  return {
    config: { ...config, sensors: newConfigSensors },
    shouldGoBack: false,
  };
}

/**
 * Handles update for lights array
 */
export function handleLightsArrayUpdate(
  config: Config,
  value: EntityConfig | string | null | undefined,
  index: number,
): SubElementChangeResult {
  const newConfigLights = (config.lights || []).concat();

  if (!value) {
    newConfigLights.splice(index, 1);
    return {
      config: { ...config, lights: newConfigLights },
      shouldGoBack: true,
    };
  }

  // Lights are always strings - extract entity_id if EntityConfig
  const entityId =
    typeof value === 'string' ? value : (value as EntityConfig).entity_id;
  newConfigLights[index] = entityId;

  return {
    config: { ...config, lights: newConfigLights },
    shouldGoBack: false,
  };
}

/**
 * Routes sub-element changes to the appropriate handler based on field and tab
 */
export function handleSubElementChanged(
  config: Config,
  value: EntityConfig | string | null | undefined,
  subElementConfig: SubElementEditorConfig,
  currentTab: number,
): SubElementChangeResult {
  const { field, index } = subElementConfig;

  // Handle single entity field (from tab 0)
  if (field === 'entities' && currentTab === 0) {
    return handleSingleEntityUpdate(config, value);
  }

  // Handle entities array (from tab 1)
  if (field === 'entities' && currentTab === 1) {
    return handleEntitiesArrayUpdate(config, value, index!);
  }

  // Handle sensors array (from tab 3)
  if (field === 'entities' && currentTab === 3) {
    return handleSensorsArrayUpdate(config, value, index!);
  }

  // Handle lights array
  if (field === 'lights') {
    return handleLightsArrayUpdate(config, value, index!);
  }

  // Default: no change
  return {
    config,
    shouldGoBack: false,
  };
}
