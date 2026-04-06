import type { HomeAssistant } from '@hass/types';
import type { EntityState } from '@type/room';
import { html, type TemplateResult } from 'lit';

/**
 * Renders a state display for a given entity
 * @param {HomeAssistant} hass - The Home Assistant instance
 * @param {EntityState} entity - The entity to render
 * @param {string | string[]} content - The content to render
 * @returns {TemplateResult} A lit-html template for the state display
 */
export const stateDisplay = (
  hass: HomeAssistant,
  entity: EntityState,
  content?: string | string[],
): TemplateResult =>
  html`<state-display
    .hass=${hass}
    .stateObj=${entity}
    .content=${content}
  ></state-display>`;
