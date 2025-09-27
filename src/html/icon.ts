import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import { shouldShowMoldIndicator } from '@delegates/checks/moldy';
import { stateActive } from '@hass/common/entity/state_active';
import type { HomeAssistant } from '@hass/types';
import { renderEntityIconStyles } from '@theme/render/icon-styles';
import { getThresholdIcon } from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Creates a state icon element for an entity
 *
 * @param {HTMLElement} element - The parent element that will contain the icon
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - Information about the entity
 * @param {string[]} classes - CSS classes to apply to the icon container
 * @param {boolean} hideIconContent - Whether to hide the icon content while keeping the container
 * @returns {TemplateResult | typeof nothing} A Lit template containing the icon element or nothing if state doesn't exist
 */
export const renderStateIcon = (
  element: HTMLElement,
  hass: HomeAssistant,
  entity: EntityInformation,
  classes: string[],
  hideIconContent: boolean = false,
): TemplateResult | typeof nothing => {
  const { state } = entity;
  if (!state) return nothing;

  const iconStyle = renderEntityIconStyles(hass, entity);
  const thresholdIcon = getThresholdIcon(entity);

  return html`<div
    class="${['icon', ...classes].join(' ')}"
    style=${iconStyle}
    @action=${handleClickAction(element, entity)}
    .actionHandler=${actionHandler(entity)}
  >
    ${hideIconContent
      ? nothing
      : html`<ha-state-icon
          .hass=${hass}
          .stateObj=${state}
          .icon=${thresholdIcon || entity.config.icon}
        ></ha-state-icon>`}
  </div>`;
};

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
 * @returns {TemplateResult | typeof nothing} A Lit template containing the room icon element or nothing if state doesn't exist
 */
export const renderRoomIcon = (
  hass: HomeAssistant,
  entity: EntityInformation,
  config: Config,
): TemplateResult | typeof nothing => {
  const { state } = entity;
  if (!state) return nothing;

  return html`<room-state-icon
    .entity=${entity}
    .hass=${hass}
    .config=${config}
  ></room-state-icon>`;
};
