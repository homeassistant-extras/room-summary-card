/**
 * @file Sub-element Change Handler Utilities
 * @description Utility functions for handling sub-element configuration changes in the editor.
 */

import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { LightConfig, LightConfigObject } from '@type/config/light';
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
 * Type alias for entity configuration values that can be EntityConfig, string, null, or undefined
 */
type EntityConfigValue = EntityConfig | string | null | undefined;

/**
 * Normalizes a value to either a string or EntityConfig
 */
function normalizeEntityValue(
  value: EntityConfigValue,
): EntityConfig | string | undefined {
  if (!value) {
    return undefined;
  }
  return value;
}

/**
 * Handles update for single entity field (tab 0)
 */
export function handleSingleEntityUpdate(
  config: Config,
  value: EntityConfigValue,
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
  value: EntityConfigValue,
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
  value: EntityConfigValue,
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
  value: EntityConfig | LightConfigObject | string | null | undefined,
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

  // Lights can be strings or LightConfigObject
  // If it's a string, use it directly
  // If it's a LightConfigObject (has type property), use it as object
  // If it's an EntityConfig (has label/attribute/icon/etc but no type), extract entity_id as string
  let lightConfig: LightConfig;
  if (typeof value === 'string') {
    lightConfig = value;
  } else if ('type' in value) {
    // It's a LightConfigObject - use it as is, but simplify to string if type is undefined
    const lightObj: LightConfigObject = {
      entity_id: value.entity_id,
      ...(value.type ? { type: value.type } : {}),
    };
    // If type is not set, simplify to just the entity_id string
    lightConfig = lightObj.type ? lightObj : lightObj.entity_id;
  } else {
    // It's an EntityConfig (has label/attribute/icon/etc but no type) - extract just entity_id as string
    lightConfig = value.entity_id;
  }

  newConfigLights[index] = lightConfig;

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
  value: EntityConfig | LightConfigObject | string | null | undefined,
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
