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
 * Options for rendering a room icon
 */
export interface RoomIconOptions {
  /** Whether this is the main room entity (will handle hiding logic internally) */
  isMainRoomEntity?: boolean;
  /** Whether the room is considered active (for styling) */
  isActive?: boolean;
  /** Whether the room has a background image */
  hasImage?: boolean;
  /** Whether the room is occupied (for occupancy styling) */
  occupied?: boolean;
  /** Whether smoke is detected (takes priority over occupancy) */
  smoke?: boolean;
}

/**
 * Creates a room icon element for an entity
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - Information about the entity
 * @param {Config} config - The configuration object
 * @param {RoomIconOptions} options - Optional styling and behavior options
 * @returns {TemplateResult | typeof nothing} A Lit template containing the room icon element or nothing if state doesn't exist
 */
export const renderRoomIcon = (
  hass: HomeAssistant,
  entity: EntityInformation,
  config: Config,
  options: RoomIconOptions = {},
): TemplateResult | typeof nothing => {
  const { state } = entity;
  const stickyEntitiesEnabled = config.features?.includes('sticky_entities');
  const {
    isMainRoomEntity = false,
    isActive,
    hasImage,
    occupied,
    smoke,
  } = options;

  // If state is undefined and sticky entities is not enabled, return nothing
  if (!state && !stickyEntitiesEnabled) return nothing;
  if (!state && stickyEntitiesEnabled) {
    return html`<div class="sticky-entity"></div>`;
  }

  /*
   * Order of properties is important for logic checks
   * Set config and hass last
   */
  return html`<room-state-icon
    .isMainRoomEntity=${isMainRoomEntity}
    .isActive=${isActive}
    .image=${hasImage}
    .occupied=${occupied}
    .smoke=${smoke}
    .entity=${entity}
    .config=${config}
    .hass=${hass}
  ></room-state-icon>`;
};
