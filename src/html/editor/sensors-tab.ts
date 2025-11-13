import {
  getSensorsSchemaRest,
  sensorsFeaturesSchema,
} from '@editor/editor-schema';
import { computeLabel } from '@editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config } from '@type/config';
import { html, type TemplateResult } from 'lit';

export interface SensorsTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  sensorClasses: string[];
  onValueChanged: (ev: CustomEvent) => void;
  onSensorsRowChanged: (ev: CustomEvent) => void;
  onEditDetailElement: (ev: CustomEvent) => void;
}

/**
 * Renders the Sensors tab content for the editor
 * @param params - Parameters for rendering the sensors tab
 * @returns TemplateResult with the sensors tab HTML
 */
export function renderSensorsTab(params: SensorsTabParams): TemplateResult {
  const {
    hass,
    config,
    entities,
    sensorClasses,
    onValueChanged,
    onSensorsRowChanged,
    onEditDetailElement,
  } = params;

  const restSchema = getSensorsSchemaRest(hass, sensorClasses);

  return html`
    <div class="entities-tab">
      <div class="info-header">
        ${localize(hass, 'editor.sensor.sensors_info')}
      </div>
      <room-summary-entities-row-editor
        .hass=${hass}
        .entities=${config.sensors}
        .availableEntities=${entities}
        field="entities"
        label=${hass.localize('editor.sensor.individual_sensor_entities') ||
        'Individual sensor entities'}
        @value-changed=${onSensorsRowChanged}
        @edit-detail-element=${onEditDetailElement}
      ></room-summary-entities-row-editor>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${restSchema}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
      <div class="info-header">
        <div>${localize(hass, 'editor.sensor.features_info')}</div>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>${localize(hass, 'editor.sensor.hide_sensors_desc')}</li>
          <li>${localize(hass, 'editor.sensor.hide_sensor_icons_desc')}</li>
          <li>${localize(hass, 'editor.sensor.hide_sensor_labels_desc')}</li>
        </ul>
      </div>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${[sensorsFeaturesSchema(hass)]}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
    </div>
  `;
}
