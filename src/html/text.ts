import { hasFeature } from '@/config/feature';
import { getDevice } from '@delegates/retrievers/device';
import { getEntity } from '@delegates/retrievers/entity';
import { getState } from '@delegates/retrievers/state';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Gets the climate label combining temperature and humidity when available
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} Formatted climate information HTML, or nothing if no valid states or feature is disabled
 */
export const renderLabel = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || hasFeature(config, 'hide_climate_label')) return nothing;

  const temp = getState(hass, config.temperature_sensor);
  const humidity = getState(hass, config.humidity_sensor);

  if (!temp && !humidity) return nothing;

  const parts: string[] = [];
  if (temp?.state) {
    parts.push(`${temp.state}${temp.attributes?.unit_of_measurement ?? ''}`);
  }

  if (humidity?.state) {
    parts.push(
      `${humidity.state}${humidity.attributes?.unit_of_measurement ?? ''}`,
    );
  }

  if (!parts.length) return nothing;

  return html`<p>${parts.join(' - ')}</p>`;
};

/**
 * Gets statistics about devices and entities in the area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} Formatted statistics HTML, or nothing if no statistics or feature is disabled
 */
export const renderAreaStatistics = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || hasFeature(config, 'hide_area_stats')) return nothing;

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
