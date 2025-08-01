import type { HomeAssistant } from '@hass/types';
import { renderTextStyles } from '@theme/render/text-styles';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { html } from 'lit';
import { renderAreaStatistics } from './area-statistics';

/**
 * Renders the information section for a room summary card.
 *
 * @param hass - The Home Assistant instance containing state and configuration.
 * @param roomInformation - Metadata about the room, such as its name.
 * @param roomEntity - The main entity representing the room.
 * @param config - Card configuration options.
 * @param sensors - A list of sensor entity states relevant to the room.
 * @returns A lit-html template representing the room information section.
 */
export const info = (
  hass: HomeAssistant,
  roomInformation: RoomInformation,
  roomEntity: EntityInformation,
  config: Config,
  sensors: SensorData,
) => {
  const textStyle = renderTextStyles(hass, config, roomEntity);
  const stats = renderAreaStatistics(hass, config);

  return html`<div class="info">
    <div class="name text" style=${textStyle}>${roomInformation.area_name}</div>
    ${stats}
    <sensor-collection
      .config=${config}
      .sensors=${sensors}
      .hass=${hass}
    ></sensor-collection>
  </div>`;
};
