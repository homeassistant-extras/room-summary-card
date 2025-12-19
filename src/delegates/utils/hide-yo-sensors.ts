import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/retrievers/device';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { LightConfig } from '@type/config/light';
import type { SensorConfig } from '@type/config/sensor';
import type { EntityState } from '@type/room';
import type { SensorData } from '@type/sensor';
import { calculateAverages } from './sensor-averages';

/**
 * Helper function to extract entity_id from LightConfig
 */
const getLightEntityId = (light: LightConfig): string => {
  return typeof light === 'string' ? light : light.entity_id;
};

/**
 * Helper function to check if a light config is ambient type
 */
const isAmbientLight = (light: LightConfig): boolean => {
  return typeof light !== 'string' && light.type === 'ambient';
};

/**
 * Retrieves sensor data for a given area based on the provided configuration.
 *
 * This function returns both individual sensors specified in config.sensors and
 * averaged sensors based on device classes specified in config.sensor_classes.
 * It also collects light entities for the multi-light background feature during
 * the same iteration to improve performance.
 *
 * @param hass - The Home Assistant instance containing entities and their states.
 * @param config - The configuration object specifying sensor settings.
 * @returns SensorData object containing individual and averaged sensor information, plus light entities.
 */
export const getSensors = (hass: HomeAssistant, config: Config): SensorData => {
  const skipDefaultEntities = hasFeature(config, 'exclude_default_entities');
  const multiLightEnabled = hasFeature(config, 'multi_light_background');

  // Default sensor classes if not specified
  const sensorClasses = config.sensor_classes || [
    'temperature',
    'humidity',
    'illuminance',
  ];

  // Arrays to hold different categories
  const configOrderedSensors: EntityState[] = [];
  const classSensors: EntityState[] = [];
  const problemSensors: EntityState[] = [];
  const lightEntities: EntityState[] = [];
  const ambientLightEntities: EntityState[] = [];
  const thresholdSensors: EntityState[] = [];
  let mold: EntityState | undefined = undefined;

  // Get configured light entity IDs and their types if multi-light feature is enabled
  // Build a map of entity_id -> isAmbient for quick lookup
  const configuredLightIds: string[] = [];
  const ambientLightIds = new Set<string>();
  if (multiLightEnabled && config.lights && config.lights.length > 0) {
    config.lights.forEach((light) => {
      const entityId = getLightEntityId(light);
      configuredLightIds.push(entityId);
      if (isAmbientLight(light)) {
        ambientLightIds.add(entityId);
      }
    });
  }

  // Helper function to extract entity_id from string or SensorConfig
  const getSensorEntityId = (sensor: string | SensorConfig): string => {
    return typeof sensor === 'string' ? sensor : sensor.entity_id;
  };

  // Get array of entity IDs from config.sensors for quick lookup
  const configSensorIds = config.sensors?.map(getSensorEntityId) || [];

  // Extract threshold entity IDs from threshold entries' value properties
  const thresholdSensorIds = new Set<string>();
  if (config.thresholds?.temperature) {
    config.thresholds.temperature.forEach((entry) => {
      if (typeof entry.value === 'string') {
        thresholdSensorIds.add(entry.value);
      }
    });
  }
  if (config.thresholds?.humidity) {
    config.thresholds.humidity.forEach((entry) => {
      if (typeof entry.value === 'string') {
        thresholdSensorIds.add(entry.value);
      }
    });
  }

  // Process all entities in the area
  Object.values(hass.entities).forEach((entity) => {
    // Check if this sensor is explicitly configured
    const isConfigSensor = configSensorIds.includes(entity.entity_id);
    const device = getDevice(hass.devices, entity.device_id);
    const isInArea = [entity.area_id, device?.area_id].includes(config.area);

    // Check if this is a configured light entity (always process these)
    const isConfiguredLight = configuredLightIds.includes(entity.entity_id);
    // Check if this is a configured threshold entity (always process these)
    const isThresholdEntity = thresholdSensorIds.has(entity.entity_id);

    // If it's not a config sensor, not in the area, and not a configured light, skip it
    // If it's a config sensor or configured light, always include it since the user has explicitly included it
    if (
      !isConfigSensor &&
      !isInArea &&
      !isConfiguredLight &&
      !isThresholdEntity
    )
      return;

    const state = getState(hass.states, entity.entity_id);
    if (!state) return;

    // Collect light entities for multi-light background feature
    if (multiLightEnabled) {
      if (isConfiguredLight) {
        // Configured light - check if it's ambient or regular
        if (ambientLightIds.has(entity.entity_id)) {
          ambientLightEntities.push(state);
        } else {
          lightEntities.push(state);
        }
      } else if (
        !config.lights?.length &&
        isInArea &&
        entity.entity_id.startsWith('light.')
      ) {
        // Auto-discovered light (only when no lights are manually configured)
        // Auto-discovered lights are always regular (not ambient)
        lightEntities.push(state);
      }
    }

    if (entity?.labels?.includes('problem')) {
      problemSensors.push(state);
    }

    if (entity?.platform === 'mold_indicator') {
      mold = state;
    }

    // If it's a config sensor, always include it in individual sensors
    if (isConfigSensor) {
      configOrderedSensors.push(state);
      return;
    }

    if (isThresholdEntity) {
      thresholdSensors.push(state);
      return;
    }

    // If we're skipping default entities, don't process further
    if (skipDefaultEntities) return;

    // Check if this is a sensor with a device class we care about
    const deviceClass = state.attributes?.device_class;
    if (
      state.domain === 'sensor' &&
      deviceClass &&
      sensorClasses.includes(deviceClass)
    ) {
      classSensors.push(state);
    }
  });

  // Sort config sensors by their order in the config array
  configOrderedSensors.sort((a, b) => {
    const indexA = configSensorIds?.indexOf(a.entity_id) ?? -1;
    const indexB = configSensorIds?.indexOf(b.entity_id) ?? -1;
    return indexA - indexB;
  });

  // Calculate averages for class-based sensors
  const averaged = calculateAverages(classSensors, sensorClasses);

  return {
    individual: configOrderedSensors,
    averaged,
    problemSensors,
    mold,
    lightEntities,
    ambientLightEntities,
    thresholdSensors,
  };
};
