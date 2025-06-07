import { hasFeature } from '@/config/feature';
import { sensorDataToDisplaySensors } from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import type { HassEntity } from '@hass/ws/types';
import type { Config, SensorData } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Renders the sensor collection label for the area
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {Config} config - The configuration object
 * @param {SensorData[]} sensors - Sensor data including individual and averaged sensors
 * @returns {TemplateResult | typeof nothing} Formatted sensor information HTML, or nothing if no valid sensors or feature is disabled
 */
export const renderSensors = (
  hass: HomeAssistant,
  config: Config,
  sensors: SensorData,
): TemplateResult | typeof nothing => {
  if (!hass || hasFeature(config, 'hide_climate_label')) return nothing;
  const hideIcon = hasFeature(config, 'hide_sensor_icons');

  const sensorElements = sensorDataToDisplaySensors(sensors).map((sensor) => {
    return html`<div class="sensor">
      ${hideIcon
        ? nothing
        : html`<ha-domain-icon
            .hass=${hass}
            .domain=${sensor.domain}
            .deviceClass=${sensor.device_class}
          ></ha-domain-icon>`}
      ${sensor.is_averaged
        ? sensor.value
        : hass.formatEntityState(sensor.state as HassEntity)}
    </div>`;
  });

  return html`<div class="sensors-container">${sensorElements}</div>`;
};
