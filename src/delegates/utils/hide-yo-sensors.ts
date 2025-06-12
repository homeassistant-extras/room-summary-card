import { hasFeature } from '@config/feature';
import { getDevice } from '@delegates/retrievers/device';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import type { SensorData } from '@type/sensor';
import { calculateAverages } from './sensor-averages';

/**
 * Retrieves sensor data for a given area based on the provided configuration.
 *
 * This function returns both individual sensors specified in config.sensors and
 * averaged sensors based on device classes specified in config.sensor_classes.
 *
 * @param hass - The Home Assistant instance containing entities and their states.
 * @param config - The configuration object specifying sensor settings.
 * @returns SensorData object containing individual and averaged sensor information.
 */
export const getSensors = (hass: HomeAssistant, config: Config): SensorData => {
  const skipDefaultEntities = hasFeature(config, 'exclude_default_entities');

  // Default sensor classes if not specified
  const sensorClasses = config.sensor_classes || ['temperature', 'humidity'];

  // Arrays to hold different categories
  const configOrderedSensors: EntityState[] = [];
  const classSensors: EntityState[] = [];

  // Process all entities in the area
  Object.values(hass.entities).forEach((entity) => {
    // Check if this sensor is explicitly configured
    const isConfigSensor = config.sensors?.includes(entity.entity_id);

    const device = getDevice(hass.devices, entity.device_id);
    if (
      !isConfigSensor &&
      ![(entity.area_id, device?.area_id)].includes(config.area)
    )
      return;

    const state = getState(hass.states, entity.entity_id);
    if (!state) return;

    // If it's a config sensor, always include it in individual sensors
    if (isConfigSensor) {
      configOrderedSensors.push(state);
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
    const indexA = config.sensors?.indexOf(a.entity_id) ?? -1;
    const indexB = config.sensors?.indexOf(b.entity_id) ?? -1;
    return indexA - indexB;
  });

  // Calculate averages for class-based sensors
  const averaged = calculateAverages(classSensors, sensorClasses);

  return {
    individual: configOrderedSensors,
    averaged,
  };
};
