import { LabelTemplateConnection } from '@delegates/label-template-connection';
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import { isTemplateString } from '@hass/common/string/is_template';
import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import { getEntityLabel, getThresholdResult } from '@theme/threshold-color';
import type { EntityInformation } from '@type/room';
import { html, nothing, type TemplateResult } from 'lit';

/** Final fallback when no configured label applies. */
export type EntityLabelFallback = 'entity-name' | 'state-display';

/**
 * Renders label content for an entity row: threshold/state label, Jinja
 * `label`, static text, then the configured fallback.
 * priority: state/threshold label > config label > attribute value > entity name
 */
export function renderConfiguredEntityLabel(
  hass: HomeAssistant,
  entity: EntityInformation,
  conn: LabelTemplateConnection,
  fallback: EntityLabelFallback,
): TemplateResult | typeof nothing {
  // First priority: label from state/threshold result
  // or a configured label (second priority)
  const thresholdResult = getThresholdResult(entity);
  const label = getEntityLabel(entity, thresholdResult);

  // check if the label is a template string
  if (label && isTemplateString(label)) {
    conn.sync(hass, entity.config.entity_id, label);
    return html`${conn.displayedText}`;
  }

  conn.disconnect();

  // if the label is not a template string, return it
  if (label) {
    return html`${label}`;
  }

  const state = entity.state;
  if (!state) {
    return nothing;
  }

  // Third priority: attribute value if attribute is configured
  if (entity.config.attribute || fallback === 'state-display') {
    return stateDisplay(hass, state, entity.config.attribute);
  }

  // Fallback: entity name
  return html`${computeEntityName(state, hass)}`;
}
