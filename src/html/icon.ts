import {
  actionHandler,
  handleClickAction,
} from '@/delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import {
  getProblemEntitiesStyle,
  renderEntityIconStyles,
} from '@theme/render/icon-styles';
import type { EntityInformation } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

/**
 * Creates a state icon element for an entity
 *
 * @param {HTMLElement} element - The parent element that will contain the icon
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityInformation} entity - Information about the entity
 * @param {string[]} classes - CSS classes to apply to the icon container
 * @returns {TemplateResult | typeof nothing} A Lit template containing the icon element or nothing if state doesn't exist
 */
export const renderStateIcon = (
  element: HTMLElement,
  hass: HomeAssistant,
  entity: EntityInformation,
  classes: string[],
): TemplateResult | typeof nothing => {
  const { state } = entity;
  if (!state) return nothing;

  const iconStyle = renderEntityIconStyles(hass, entity);

  return html`<div
    class="${['icon', ...classes].join(' ')}"
    style=${iconStyle}
    @action=${handleClickAction(element, entity)}
    .actionHandler=${actionHandler(entity)}
  >
    <ha-state-icon
      .hass=${hass}
      .stateObj=${state}
      .icon=${entity.config.icon}
    ></ha-state-icon>
  </div>`;
};

/**
 * Renders the problem indicator icon if problems exist
 *
 * @param {string[]} problemEntities - Array of entity IDs that have problems
 * @param {boolean} problemExists - Whether there is an active problem that needs attention
 * @returns {TemplateResult | typeof nothing} The rendered problem indicator or nothing if no problem entities exist
 */
export const renderProblemIndicator = (
  problemEntities: string[],
  problemExists: boolean,
): TemplateResult | typeof nothing => {
  if (problemEntities.length === 0) {
    return nothing;
  }

  const styles = getProblemEntitiesStyle(problemExists);

  return html`
    <ha-icon
      .icon=${`mdi:numeric-${problemEntities.length}`}
      class="status-entities"
      style=${styles}
    />
  `;
};
