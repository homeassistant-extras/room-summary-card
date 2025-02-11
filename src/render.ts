import { html, nothing, type TemplateResult } from 'lit';
import { getState } from './helpers';
import type { Config } from './types/config';
import type { HomeAssistant } from './types/homeassistant';

/**
 * Gets the climate label combining temperature and humidity when available
 * @returns {string} Formatted climate information, empty if no valid states
 */
export const renderLabel = (
  hass: HomeAssistant,
  config: Config,
): TemplateResult | typeof nothing => {
  if (!hass || !config || config.features?.includes('hide_climate_label'))
    return nothing;

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
