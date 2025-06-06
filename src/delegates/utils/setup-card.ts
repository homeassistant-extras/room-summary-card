import { getArea } from '@delegates/retrievers/area';
import type { HomeAssistant } from '@hass/types';
import type {
  Config,
  EntityInformation,
  EntityState,
  RoomInformation,
} from '@type/config';
import { getSensors } from './hide-yo-sensors';
import { getIconEntities } from './icon-entities';
import { getProblemEntities } from './problem-entities';
import { getRoomEntity } from './room-entity';

export interface RoomProperties {
  roomInfo: RoomInformation;
  states: EntityInformation[];
  roomEntity: EntityInformation;
  problemEntities: string[];
  problemExists: boolean;
  sensors: EntityState[];
  isDarkMode: boolean;
}

/**
 * Retrieves and assembles various properties and entities related to a room based on the provided Home Assistant instance and configuration.
 *
 * This function gathers information such as the room's name, associated entities for icons, the main room entity, problem entities (and whether any problems exist),
 * as well as temperature and humidity sensors (with backward compatibility for legacy configurations). It also collects any additional sensors specified in the config,
 * and determines if dark mode is enabled in the Home Assistant themes.
 *
 * @param hass - The Home Assistant instance containing state and configuration data.
 * @param config - The configuration object specifying area, sensors, and other options for the room.
 * @returns An object containing:
 *   - `roomInfo`: Basic information about the room (e.g., area name).
 *   - `states`: Entities used for displaying icons.
 *   - `roomEntity`: The main entity representing the room.
 *   - `problemEntities`: Entities indicating problems in the room.
 *   - `problemExists`: Boolean indicating if any problems exist.
 *   - `sensors`: Array of sensor states (temperature, humidity, and additional sensors).
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
