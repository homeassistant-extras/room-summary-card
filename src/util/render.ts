import { actionHandler, handleClickAction } from '@common/action-handler';
import { feature } from '@common/feature';
import {
  getEntityIconStyles,
  getProblemEntitiesStyle,
} from '@theme/render-styles';
import type { Config, EntityInformation } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { html, nothing, type TemplateResult } from 'lit';
import { getDevice, getEntity, getState } from '../helpers';

/**
 * Gets the climate label combining temperature and humidity when available
 * @returns {string} Formatted climate information, empty if no valid states
 */
export const renderLabel = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || feature(config, 'hide_climate_label')) return nothing;

  const temp = getState(hass, config.temperature_sensor);
  const humidity = getState(hass, config.humidity_sensor);

  if (!temp && !humidity) return nothing;

  const parts: string[] = [];
  if (temp?.state) {
    parts.push(`${temp.state}${temp.attributes?.unit_of_measurement || ''}`);
  }

  if (humidity?.state) {
    parts.push(
      `${humidity.state}${humidity.attributes?.unit_of_measurement || ''}`,
    );
  }

  if (!parts.length) return nothing;

  return html`<p>${parts.join(' - ')}</p>`;
};

/**
 * Gets statistics about devices and entities in the area
 * @returns {string} Formatted statistics
 */
export const renderAreaStatistics = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || feature(config, 'hide_area_stats')) return nothing;

  const devices = Object.keys(hass.devices).filter(
    (k) => getDevice(hass, k).area_id === config.area,
  );

  const entities = Object.keys(hass.entities).filter((k) => {
    const entity = getEntity(hass, k);
    return entity.area_id === config.area || devices.includes(entity.device_id);
  });

  const stats = [
    [devices.length, 'devices'],
    [entities.length, 'entities'],
  ]
    .filter((count) => count.length > 0)
    .map(([count, type]) => `${count} ${type}`)
    .join(' ');

  return html`<span class="stats">${stats}</span>`;
};

/**
 * Creates a state icon element for an entity
 *
 * @param {HTMLElement} element - The parent element that will contain the icon
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - Information about the entity
 * @param {String[]} classes - CSS classes to apply to the icon container
 * @returns {TemplateResult} A Lit template containing the icon element
 */

export const renderStateIcon = (
  element: HTMLElement,
  hass: HomeAssistant,
  entity: EntityInformation,
  classes: String[],
): TemplateResult | typeof nothing => {
  const { state } = entity;
  if (!state) return nothing;

  const { iconStyle } = getEntityIconStyles(hass, state);

  return html`<div
    class="${['icon', ...classes].join(' ')}"
    style=${iconStyle}
    @action=${handleClickAction(element, entity)}
    .actionHandler=${actionHandler(entity)}
  >
    <ha-state-icon
      .hass=${hass}
      .stateObj=${state}
      .icon=${entity.config.icon}
    ></ha-state-icon>
  </div>`;
};

/**
 * Renders the problem indicator icon if problems exist
 * @returns {TemplateResult | typeof nothing} The rendered problem indicator or nothing
 */
export const renderProblemIndicator = (
  problemEntities: string[],
  problemExists: boolean,
): TemplateResult | typeof nothing => {
  if (problemEntities.length === 0) {
    return nothing;
  }

  const styles = getProblemEntitiesStyle(problemExists);

  return html`
    <ha-icon
      .icon=${`mdi:numeric-${problemEntities.length}`}
      class="status-entities"
      style=${styles}
    />
  `;
};
