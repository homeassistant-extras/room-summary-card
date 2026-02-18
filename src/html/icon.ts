import { showProblemDialog } from '@cards/components/problem/dialog/show-dialog-problem';
import { shouldShowMoldIndicator } from '@delegates/checks/moldy';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders the problem indicator with count if problems exist
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {SensorData} sensors - The sensor data
 * @param {Config} config - The configuration object
 * @param {HTMLElement} element - The element to fire events from
 * @returns {TemplateResult | typeof nothing} The rendered problem indicator or nothing if no problem entities exist
 */
export const renderProblemIndicator = (
  hass: HomeAssistant,
  config: Config,
  sensors: SensorData,
  element: HTMLElement,
): TemplateResult | typeof nothing => {
  const { problemSensors } = sensors;

  const problemExists = problemSensors.some((sensor) => stateActive(sensor));
  const problemDisplay = config.problem?.display ?? 'always';

  // Determine if we should show the problem indicator
  let shouldShowIndicator = false;
  if (problemDisplay === 'always') {
    shouldShowIndicator = problemSensors.length > 0;
  } else if (problemDisplay === 'active_only') {
    shouldShowIndicator = problemSensors.length > 0 && problemExists;
  }

  return html`<div class="problems">
    ${shouldShowIndicator
      ? html`<span
          class="status-entities"
          ?has-problems=${problemExists}
          @click=${() =>
            showProblemDialog(element, {
              entities: problemSensors,
              config,
            })}
          >${problemSensors.length}</span
        >`
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
  /** Current alarm state: 'smoke', 'gas', 'water', 'occupied', or undefined */
  alarm?: 'smoke' | 'gas' | 'water' | 'occupied';
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
  const { isMainRoomEntity = false, isActive, hasImage, alarm } = options;

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
    .alarm=${alarm}
    .entity=${entity}
    .config=${config}
    .hass=${hass}
  ></room-state-icon>`;
};
