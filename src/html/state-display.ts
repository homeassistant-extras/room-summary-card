import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/config';
import { html, type TemplateResult } from 'lit';

/**
 * Renders a state display for a given entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} entity - The entity to render
 * @param {string} className - Optional CSS class for styling
 * @returns {TemplateResult} A lit-html template for the state display
 */
export const stateDisplay = (
  hass: HomeAssistant,
  entity: EntityState,
  className: string = '',
): TemplateResult =>
  html`<state-display
    .hass=${hass}
    .stateObj=${entity}
    class=${className}
  ></state-display>`;
