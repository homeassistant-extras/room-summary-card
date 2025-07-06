import { getOccupancyState } from '@delegates/checks/occupancy';
import { climateThresholds } from '@delegates/checks/thresholds';
import { getArea } from '@delegates/retrievers/area';
import type { HomeAssistant } from '@hass/types';
import { getBackgroundImageUrl } from '@theme/image/get-pic';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { getRoomEntity } from '../entities/room-entity';
import { getSensors } from './hide-yo-sensors';

export interface RoomProperties {
  roomInfo: RoomInformation;
  roomEntity: EntityInformation;
  sensors: SensorData;
  image?: string | null;
  flags: {
    occupied: boolean;
    dark: boolean;
    hot: boolean;
    humid: boolean;
  };
}

/**
 * Retrieves and assembles various properties and entities related to a room based on the provided Home Assistant instance and configuration.
 *
 * This function gathers information such as the room's name, associated entities for icons, the main room entity, problem entities (and whether any problems exist),
 * as well as sensor data including both individual sensors and averaged readings by device class. It also determines if dark mode is enabled in the Home Assistant themes.
 *
 * @param hass - The Home Assistant instance containing state and configuration data.
 * @param config - The configuration object specifying area, sensors, and other options for the room.
 * @returns {RoomProperties} An object containing assembled room properties and related entities.
 */
export const getRoomProperties = (
  hass: HomeAssistant,
  config: Config,
): RoomProperties => {
  const roomInfo: RoomInformation = {
    area_name:
      config.area_name ?? getArea(hass.areas, config.area)?.name ?? config.area,
  };
  const roomEntity = getRoomEntity(hass, config);
  const sensors = getSensors(hass, config);
  const thresholds = climateThresholds(config, sensors);
  const image = getBackgroundImageUrl(hass, config);
  const occupied = getOccupancyState(hass, config.occupancy);

  return {
    roomInfo,
    roomEntity,
    sensors,
    image,
    flags: {
      occupied,
      dark: hass.themes.darkMode,
      ...thresholds,
    },
  };
};
