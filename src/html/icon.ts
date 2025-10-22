import { shouldShowMoldIndicator } from '@delegates/checks/moldy';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders the problem indicator icon if problems exist
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {SensorData} sensors - The sensor data
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} The rendered problem indicator or nothing if no problem entities exist
 */
export const renderProblemIndicator = (
  hass: HomeAssistant,
  config: Config,
  sensors: SensorData,
): TemplateResult | typeof nothing => {
  const { problemSensors } = sensors;

  const problemExists = problemSensors.some((sensor) => stateActive(sensor));

  return html`<div class="problems">
    ${problemSensors.length > 0
      ? html`<ha-icon
          .icon=${`mdi:numeric-${problemSensors.length}`}
          class="status-entities"
          ?has-problems=${problemExists}
        ></ha-icon>`
      : nothing}
    ${sensors.mold && shouldShowMoldIndicator(sensors.mold, config)
      ? html`<div class="mold-indicator">
          <ha-state-icon
            .hass=${hass}
            .stateObj=${sensors.mold}
          ></ha-state-icon>
          <span class="mold-text">${stateDisplay(hass, sensors.mold)}</span>
        </div>`
      : nothing}
  </div>`;
};

/**
 * Creates a room icon element for an entity
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - Information about the entity
 * @param {Config} config - The configuration object
 * @param {boolean} isMainRoomEntity - Whether this is the main room entity (will handle hiding logic internally)
 * @param {boolean} isActive - Whether the room is considered active (for styling)
 * @param {boolean} hasImage - Whether the room has a background image
 * @param {boolean} occupied - Whether the room is occupied (for occupancy styling)
 * @returns {TemplateResult | typeof nothing} A Lit template containing the room icon element or nothing if state doesn't exist
 */
export const renderRoomIcon = (
  hass: HomeAssistant,
  entity: EntityInformation,
  config: Config,
  isMainRoomEntity: boolean = false,
  isActive?: boolean,
  hasImage?: boolean,
  occupied?: boolean,
): TemplateResult | typeof nothing => {
  const { state } = entity;
  if (!state) return nothing;

  /*
   * Order of properties is important for logic checks
   * Set config and hass last
   */
  return html`<room-state-icon
    .isMainRoomEntity=${isMainRoomEntity}
    .isActive=${isActive}
    .image=${hasImage}
    .occupied=${occupied}
    .entity=${entity}
    .config=${config}
    .hass=${hass}
  ></room-state-icon>`;
};
