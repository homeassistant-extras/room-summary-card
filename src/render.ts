import type { Config } from '@type/config';
import type { HomeAssistant } from '@type/homeassistant';
import { html, nothing, type TemplateResult } from 'lit';
import { feature } from './common/feature';
import { getDevice, getEntity, getState } from './helpers';

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
