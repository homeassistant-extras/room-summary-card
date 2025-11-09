import { getAreaSchema, getMainSchemaRest } from '@/editor/editor-schema';
import { computeLabel } from '@/editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import { html, type TemplateResult } from 'lit';

export interface MainTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
  onEntityRowChanged: (ev: CustomEvent) => void;
  onEditDetailElement: (ev: CustomEvent) => void;
}

/**
 * Renders the Main tab content for the editor
 * @param params - Parameters for rendering the main tab
 * @returns TemplateResult with the main tab HTML
 */
export function renderMainTab(params: MainTabParams): TemplateResult {
  const {
    hass,
    config,
    entities,
    onValueChanged,
    onEntityRowChanged,
    onEditDetailElement,
  } = params;

  const areaSchema = getAreaSchema();
  const restSchema = getMainSchemaRest(hass, entities);

  // Convert single entity to array for row-editor
  const entityArray = config.entity ? [config.entity] : [];

  return html`
    <div class="entities-tab">
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${[areaSchema]}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
      <room-summary-entities-row-editor
        .hass=${hass}
        .entities=${entityArray}
        .availableEntities=${entities}
        field="entities"
        .single=${true}
        label=${hass.localize('editor.area.room_entity') || 'Room Entity'}
        @value-changed=${onEntityRowChanged}
        @edit-detail-element=${onEditDetailElement}
      ></room-summary-entities-row-editor>
      <ha-form
        .hass=${hass}
        .data=${config}
        .schema=${restSchema}
        .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
        @value-changed=${onValueChanged}
      ></ha-form>
    </div>
  `;
}
