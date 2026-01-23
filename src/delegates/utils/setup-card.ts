import {
  getGasState,
  getOccupancyState,
  getSmokeState,
  getWaterState,
} from '@delegates/checks/occupancy';
import {
  climateThresholds,
  type ClimateThresholds,
} from '@delegates/checks/thresholds';
import { getArea } from '@delegates/retrievers/area';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import { getBackgroundImageUrl } from '@theme/image/get-pic';
import { getViewTheme } from '@theme/util/get-view-theme';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { getRoomEntity } from '../entities/room-entity';
import { getSensors } from './hide-yo-sensors';

export interface RoomProperties {
  roomInfo: RoomInformation;
  roomEntity: EntityInformation;
  sensors: SensorData;
  image: Promise<string | undefined | null>;
  isActive: boolean;
  /** Whether the icon should be styled as active (excludes ambient lights) */
  isIconActive: boolean;
  thresholds: ClimateThresholds;
  flags: {
    alarm?: 'smoke' | 'gas' | 'water' | 'occupied';
    dark: boolean;
    frostedGlass: boolean;
  };
}

/**
 * Retrieves and assembles various properties and entities related to a room based on the provided Home Assistant instance and configuration.
 *
 * This function gathers information such as the room's name, associated entities for icons, the main room entity, problem entities (and whether any problems exist),
 * as well as sensor data including both individual sensors and averaged readings by device class. It also determines if dark mode is enabled in the Home Assistant themes,
 * and calculates whether the room should be considered "active" based on either the main room entity or any light entities.
 *
 * @param hass - The Home Assistant instance containing state and configuration data.
 * @param config - The configuration object specifying area, sensors, and other options for the room.
 * @param element - Optional DOM element to use for detecting view theme. If provided, will check for view-specific theme before falling back to global theme.
 * @returns {RoomProperties} An object containing assembled room properties and related entities.
 */
export const getRoomProperties = (
  hass: HomeAssistant,
  config: Config,
  element?: Element | null,
): RoomProperties => {
  const roomInfo: RoomInformation = {
    area_name:
      config.area_name ?? getArea(hass.areas, config.area)?.name ?? config.area,
  };
  const roomEntity = getRoomEntity(hass, config);
  const sensors = getSensors(hass, config);
  const thresholds = climateThresholds(config, sensors);
  const image = getBackgroundImageUrl(hass, config);
  const smokeDetected = getSmokeState(hass, config.smoke);
  const gasDetected = getGasState(hass, config.gas);
  const waterDetected = getWaterState(hass, config.water);
  const occupied = getOccupancyState(hass, config.occupancy);

  // Calculate if room entity is active
  const roomEntityActive = roomEntity.state && stateActive(roomEntity.state);

  // Calculate if any regular (non-ambient) light is active
  const regularLightActive = sensors.lightEntities.some((entityState) =>
    stateActive(entityState),
  );

  // Calculate if any ambient light is active
  const ambientLightActive = sensors.ambientLightEntities.some((entityState) =>
    stateActive(entityState),
  );

  // isActive: room entity OR any light (regular or ambient) - used for card background
  const isActive = roomEntityActive || regularLightActive || ambientLightActive;

  // isIconActive: room entity OR any regular light (NOT ambient) - used for icon styling
  const isIconActive = roomEntityActive || regularLightActive;

  // Determine alarm state with priority: Smoke > Gas > Water > Occupancy
  let alarm: 'smoke' | 'gas' | 'water' | 'occupied' | undefined;
  if (smokeDetected) {
    alarm = 'smoke';
  } else if (gasDetected) {
    alarm = 'gas';
  } else if (waterDetected) {
    alarm = 'water';
  } else if (occupied) {
    alarm = 'occupied';
  }

  // Get the view theme (falls back to global theme if not set)
  const viewTheme = getViewTheme(element, hass);

  // Detect Frosted Glass themes (e.g. "Frosted Glass", "Frosted Glass Lite").
  const frostedGlass = viewTheme?.startsWith('Frosted Glass') ?? false;

  return {
    roomInfo,
    roomEntity,
    sensors,
    image,
    isActive,
    isIconActive,
    thresholds,
    flags: {
      alarm,
      dark: hass.themes.darkMode,
      frostedGlass,
    },
  };
};
