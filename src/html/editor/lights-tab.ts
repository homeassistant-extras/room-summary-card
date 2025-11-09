import { getLightsSchema } from '@/editor/editor-schema';
import { computeLabel } from '@/editor/utils/compute-label';
import { localize } from '@/localize/localize';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface LightsTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
}

/**
 * Renders the Lights tab content for the editor
 * @param params - Parameters for rendering the lights tab
 * @returns TemplateResult with the lights tab HTML
 */
export function renderLightsTab(params: LightsTabParams): TemplateResult {
  const { hass, config, entities, onValueChanged } = params;

  const schema = getLightsSchema(hass, entities);
  const infoText = 'editor.background.multi_light_background_info';

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
