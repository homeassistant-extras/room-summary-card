import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/room';
import { html, type TemplateResult } from 'lit';

/**
 * Renders an attribute display for a given entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} entity - The entity to render
 * @param {string} attribute - The attribute name to display
 * @param {string} className - Optional CSS class for styling
 * @returns {TemplateResult} A lit-html template for the attribute display
 */
export const attributeDisplay = (
  hass: HomeAssistant,
  entity: EntityState,
  attribute: string,
  className: string = '',
): TemplateResult =>
  html`<ha-attribute-value
    hide-unit
    .hass=${hass}
    .stateObj=${entity}
    .attribute=${attribute}
    class=${className}
  ></ha-attribute-value>`;
