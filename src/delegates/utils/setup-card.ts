import { getArea } from '@delegates/retrievers/area';
import type { HomeAssistant } from '@hass/types';
import type {
  Config,
  EntityInformation,
  RoomInformation,
  SensorData,
} from '@type/config';
import { getIconEntities } from '../entities/icon-entities';
import { getProblemEntities } from '../entities/problem-entities';
import { getRoomEntity } from '../entities/room-entity';
import { getSensors } from './hide-yo-sensors';

export interface RoomProperties {
  roomInfo: RoomInformation;
  states: EntityInformation[];
  roomEntity: EntityInformation;
  problemEntities: string[];
  problemExists: boolean;
  sensors: SensorData;
  isDarkMode: boolean;
}

/**
 * Retrieves and assembles various properties and entities related to a room based on the provided Home Assistant instance and configuration.
 *
 * This function gathers information such as the room's name, associated entities for icons, the main room entity, problem entities (and whether any problems exist),
 * as well as sensor data including both individual sensors and averaged readings by device class. It also determines if dark mode is enabled in the Home Assistant themes.
 *
 * @param hass - The Home Assistant instance containing state and configuration data.
 * @param config - The configuration object specifying area, sensors, and other options for the room.
 * @returns An object containing:
 *   - `roomInfo`: Basic information about the room (e.g., area name).
 *   - `states`: Entities used for displaying icons.
 *   - `roomEntity`: The main entity representing the room.
 *   - `problemEntities`: Entities indicating problems in the room.
 *   - `problemExists`: Boolean indicating if any problems exist.
 *   - `sensorData`: Object containing individual and averaged sensor data.
 *   - `isDarkMode`: Boolean indicating if dark mode is enabled.
 */
export const getRoomProperties = (
  hass: HomeAssistant,
  config: Config,
): RoomProperties => {
  const roomInfo: RoomInformation = {
    area_name:
      config.area_name ?? getArea(hass, config.area)?.name ?? config.area,
  };
  const states = getIconEntities(hass, config);
  const roomEntity = getRoomEntity(hass, config);
  const { problemEntities, problemExists } = getProblemEntities(
    hass,
    config.area,
  );

  const sensors = getSensors(hass, config);

  return {
    roomInfo,
    states,
    roomEntity,
    problemEntities,
    problemExists,
    sensors,
    isDarkMode: hass.themes.darkMode,
  };
};
