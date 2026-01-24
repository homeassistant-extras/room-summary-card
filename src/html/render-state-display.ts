import { hasEntityFeature } from '@config/feature';
import type { HomeAssistant } from '@hass/types';
import { stateDisplay } from '@html/state-display';
import type { EntityInformation } from '@type/room';
import { shouldHideStateDisplayWhenInactive } from '@util/should-hide-state-display';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Determines whether to render the state display and returns the appropriate template.
 *
 * The state display is shown when:
 * - The `show_state` feature is enabled for the entity
 * - The icon content is not hidden
 * - The `hide_zero_attribute_domains` feature is not enabled, OR
 * - The `hide_zero_attribute_domains` feature is enabled but the entity should not be hidden
 *
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - The entity information
 * @param {boolean} hideIconContent - Whether the icon content is hidden
 * @returns {TemplateResult | typeof nothing} The state display template or nothing
 */
export function renderStateDisplay(
  hass: HomeAssistant,
  entity: EntityInformation,
  hideIconContent: boolean,
): TemplateResult | typeof nothing {
  const { state } = entity;

  // Check if show_state feature is enabled for this entity
  const showStateEnabled =
    hasEntityFeature(entity, 'show_state') && !hideIconContent;

  if (!showStateEnabled) {
    return nothing;
  }

  // Check if we should hide state display when inactive (for zero-attribute domains)
  const hideZeroAttributeDomains = hasEntityFeature(
    entity,
    'hide_zero_attribute_domains',
  );

  if (hideZeroAttributeDomains && state) {
    const shouldHideState = shouldHideStateDisplayWhenInactive(state);
    if (shouldHideState) {
      return nothing;
    }
  }

  // Render the state display
  return html`<div class="entity-state">${stateDisplay(hass, state!)}</div>`;
}
