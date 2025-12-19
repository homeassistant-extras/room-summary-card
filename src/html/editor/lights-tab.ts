import { lightsFeaturesSchema } from '@editor/editor-schema';
import { computeLabel } from '@editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface LightsTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
  onLightsRowChanged: (ev: CustomEvent) => void;
  onEditDetailElement: (ev: CustomEvent) => void;
}

/**
 * Renders the Lights tab content for the editor
 * @param params - Parameters for rendering the lights tab
 * @returns TemplateResult with the lights tab HTML
 */
export function renderLightsTab(params: LightsTabParams): TemplateResult {
  const {
    hass,
    config,
    entities,
    onValueChanged,
    onLightsRowChanged,
    onEditDetailElement,
  } = params;

  const infoText = 'editor.background.multi_light_background_info';

  return html`
    <div class="entities-tab">
      ${infoText
        ? html` <div class="info-header">${localize(hass, infoText)}</div> `
        : nothing}
      <room-summary-entities-row-editor
        .hass=${hass}
        .lights=${config.lights}
        .availableEntities=${entities}
        field="lights"
        label=${hass.localize('editor.background.light_entities') ||
        'Light entities'}
        @value-changed=${onLightsRowChanged}
        @edit-detail-element=${onEditDetailElement}
      ></room-summary-entities-row-editor>
      <div class="info-header">
        <div>${localize(hass, 'editor.features.features_info')}</div>
      </div>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${[lightsFeaturesSchema(hass)]}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
    </div>
  `;
}
