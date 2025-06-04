import { hasFeature } from '@/config/feature';
import type { HomeAssistant } from '@hass/types';
import type { Config, EntityState } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';
import { stateDisplay } from './state-display';

/**
 * Renders the sensor collection label for the area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @returns {TemplateResult | typeof nothing} Formatted climate information HTML, or nothing if no valid states or feature is disabled
 */
export const renderSensors = (
  hass: HomeAssistant,
  config: Config,
  sensors: EntityState[],
): TemplateResult | typeof nothing => {
  if (!hass || hasFeature(config, 'hide_climate_label')) return nothing;

  const r = sensors.map(
    (value) =>
      html`<div>
        <ha-state-icon .hass=${hass} .stateObj=${value}></ha-state-icon>
        ${stateDisplay(hass, value)}
      </div>`,
  );
  return html`<div class="sensors-container">${r}</div>`;
};
