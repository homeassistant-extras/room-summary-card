import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import { html, type TemplateResult } from 'lit';

/**
 * Creates a close heading for ha-dialog
 */
export const createCloseHeading = (hass: HomeAssistant): TemplateResult => html`
  <div class="header_title">
    <ha-icon-button
      .label=${hass?.localize('ui.common.close')}
      .path=${'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'}
      dialogAction="close"
      class="header_button"
    ></ha-icon-button>
    <span>${localize(hass, 'card.component.problem.dialog_title')}</span>
  </div>
`;
