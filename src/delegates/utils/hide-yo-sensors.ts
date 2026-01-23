import { hasFeature } from '@config/feature';
import { getArea } from '@delegates/retrievers/area';
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
 * When an area has default temperature or humidity sensors configured (via
 * temperature_entity_id or humidity_entity_id), this function will use those
 * specific sensors instead of automatically collecting all sensors of that device class.
 *
 * @param hass - The Home Assistant instance containing entities and their states.
 * @param config - The configuration object specifying sensor settings.
 * @returns SensorData object containing individual and averaged sensor information, plus light entities.
 */
export const getSensors = (hass: HomeAssistant, config: Config): SensorData => {
  const skipDefaultEntities = hasFeature(config, 'exclude_default_entities');
  const multiLightEnabled = hasFeature(config, 'multi_light_background');
  const hideHiddenEntities = hasFeature(config, 'hide_hidden_entities');

  // Get area information to check for configured temperature/humidity sensors
  const area = getArea(hass.areas, config.area);
  const areaHasTemperatureSensor = !!area?.temperature_entity_id;
  const areaHasHumiditySensor = !!area?.humidity_entity_id;

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

  // Helper function to check if entity should be processed
  const shouldProcessEntity = (
    isConfigSensor: boolean,
    isInArea: boolean,
    isConfiguredLight: boolean,
    isThresholdEntity: boolean,
  ): boolean => {
    return isConfigSensor || isInArea || isConfiguredLight || isThresholdEntity;
  };

  // Helper function to collect configured light entities
  const collectConfiguredLightEntity = (
    state: EntityState,
    entityId: string,
  ): void => {
    if (ambientLightIds.has(entityId)) {
      ambientLightEntities.push(state);
    } else {
      lightEntities.push(state);
    }
  };

  // Helper function to collect area light entities (when no configured lights exist)
  const collectAreaLightEntity = (
    state: EntityState,
    entityId: string,
    isInArea: boolean,
  ): void => {
    if (!config.lights?.length && isInArea && entityId.startsWith('light.')) {
      lightEntities.push(state);
    }
  };

  // Helper function to check if entity is a class sensor
  const isClassSensor = (
    state: EntityState,
    deviceClass: string | undefined,
  ): boolean => {
    return (
      state.domain === 'sensor' &&
      !!deviceClass &&
      sensorClasses.includes(deviceClass)
    );
  };

  // Process all entities in the area
  Object.values(hass.entities).forEach((entity) => {
    // Skip hidden entities if the feature is enabled
    if (hideHiddenEntities && entity.hidden) {
      return;
    }

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
      !shouldProcessEntity(
        isConfigSensor,
        isInArea,
        isConfiguredLight,
        isThresholdEntity,
      )
    ) {
      return;
    }

    const state = getState(hass.states, entity.entity_id);
    if (!state) return;

    // Collect light entities for multi-light background feature
    if (multiLightEnabled) {
      if (isConfiguredLight) {
        collectConfiguredLightEntity(state, entity.entity_id);
      } else {
        collectAreaLightEntity(state, entity.entity_id, isInArea);
      }
    }

    if (
      entity?.labels?.includes('problem') ||
      state.attributes?.device_class === 'problem'
    ) {
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

    // Check if this is the area's default temperature/humidity sensor
    const isAreaDefaultTemp =
      areaHasTemperatureSensor &&
      entity.entity_id === area.temperature_entity_id;
    const isAreaDefaultHumidity =
      areaHasHumiditySensor && entity.entity_id === area.humidity_entity_id;

    // If this is an area default sensor, add it to classSensors (unless already configured)
    if (
      (isAreaDefaultTemp || isAreaDefaultHumidity) &&
      !isConfigSensor &&
      !isThresholdEntity
    ) {
      const deviceClass = state.attributes?.device_class;
      if (isClassSensor(state, deviceClass)) {
        classSensors.push(state);
      }
      return;
    }

    // Check if this is a sensor with a device class we care about
    const deviceClass = state.attributes?.device_class;
    if (isClassSensor(state, deviceClass)) {
      // Skip temperature/humidity sensors if the area has configured defaults
      if (
        (deviceClass === 'temperature' && areaHasTemperatureSensor) ||
        (deviceClass === 'humidity' && areaHasHumiditySensor)
      ) {
        return;
      }
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
