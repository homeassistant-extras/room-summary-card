import {
  entityFeaturesSchema,
  getEntitiesStylesSchema,
} from '@/editor/editor-schema';
import { computeLabel } from '@/editor/utils/compute-label';
import { localize } from '@/localize/localize';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, type TemplateResult } from 'lit';

export interface EntitiesTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
  onEntitiesRowChanged: (ev: CustomEvent) => void;
  onEditDetailElement: (ev: CustomEvent) => void;
}

/**
 * Renders the Entities tab content for the editor
 * @param params - Parameters for rendering the entities tab
 * @returns TemplateResult with the entities tab HTML
 */
export function renderEntitiesTab(params: EntitiesTabParams): TemplateResult {
  const {
    hass,
    config,
    entities,
    onValueChanged,
    onEntitiesRowChanged,
    onEditDetailElement,
  } = params;

  return html`
    <div class="entities-tab">
      <div class="info-header">
        ${localize(hass, 'editor.entities.entities_info')}
      </div>
      <room-summary-entities-row-editor
        .hass=${hass}
        .entities=${config.entities}
        .availableEntities=${entities}
        field="entities"
        label=${hass.localize(
          'ui.panel.lovelace.editor.card.generic.entities',
        ) || 'Entities'}
        @value-changed=${onEntitiesRowChanged}
        @edit-detail-element=${onEditDetailElement}
      ></room-summary-entities-row-editor>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${getEntitiesStylesSchema(hass)}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
      <div class="info-header">
        <div>${localize(hass, 'editor.features.features_info')}</div>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>${localize(hass, 'editor.features.show_entity_labels_desc')}</li>
          <li>
            ${localize(hass, 'editor.features.exclude_default_entities_desc')}
          </li>
          <li>${localize(hass, 'editor.features.ignore_entity_desc')}</li>
          <li>${localize(hass, 'editor.features.sticky_entities_desc')}</li>
        </ul>
      </div>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${[entityFeaturesSchema(hass)]}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
    </div>
  `;
}
