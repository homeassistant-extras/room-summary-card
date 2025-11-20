import { getOccupancySchema } from '@editor/editor-schema';
import { computeLabel } from '@editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface OccupancyTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
}

/**
 * Renders the Alarm tab content for the editor (includes occupancy and smoke)
 * @param params - Parameters for rendering the alarm tab
 * @returns TemplateResult with the alarm tab HTML
 */
export function renderOccupancyTab(params: OccupancyTabParams): TemplateResult {
  const { hass, config, entities, onValueChanged } = params;

  const schema = getOccupancySchema(hass, entities);
  const infoText = 'editor.alarm.alarm_info';

  return html`
    ${infoText
      ? html` <div class="info-header">${localize(hass, infoText)}</div> `
      : nothing}
    <ha-form
      .hass=${hass}
      .data=${config}
      .schema=${schema}
      .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
      @value-changed=${onValueChanged}
    ></ha-form>
  `;
}
