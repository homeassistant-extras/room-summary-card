import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { SubscribeEntityStateMixin } from '@cards/mixins/subscribe-entity-state-mixin';
import { fireEvent } from '@hass/common/dom/fire_event';
// more-info-mixin is now compiled
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import { stateActive } from '@hass/common/entity/state_active';
import '@hass/state/more-info-mixin';
import { stateDisplay } from '@html/state-display';
import { localize } from '@localize/localize';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './styles';

/**
 * Problem Entity Row Component
 *
 * Renders a single problem entity row in the problem dialog.
 * Shows entity icon, name, state, and active/inactive indicator.
 * Uses SubscribeEntityStateMixin for live updates when entity state changes.
 */
@customElement('problem-entity-row')
export class ProblemEntityRow extends SubscribeEntityStateMixin(
  HassUpdateMixin(LitElement),
) {
  /**
   * Handles click on entity row to open more-info dialog
   */
  private _handleClick(): void {
    fireEvent(this, 'hass-more-info', {
      entityId: this.entity!,
    });
  }

  /**
   * Renders the component
   */
  override render(): TemplateResult | typeof nothing {
    d(this.config, 'problem-entity-row', 'render');
    if (!this.hass || !this.state) {
      return nothing;
    }

    const s = this.state;
    const isActive = stateActive(s);
    const displayName = computeEntityName(s, this.hass) || s.entity_id;

    return html`
      <div
        class="problem-entity-row ${isActive ? 'active' : 'inactive'}"
        @click=${this._handleClick}
      >
        <ha-state-icon .hass=${this.hass} .stateObj=${s}></ha-state-icon>
        <div class="entity-info">
          <div class="entity-name">${displayName}</div>
          <div class="entity-state">${stateDisplay(this.hass, s)}</div>
        </div>
        <div class="status-indicator">
          ${isActive
            ? html`<span class="active-badge"
                >${localize(this.hass, 'card.component.problem.active')}</span
              >`
            : html`<span class="inactive-badge"
                >${localize(this.hass, 'card.component.problem.inactive')}</span
              >`}
        </div>
      </div>
    `;
  }

  static override get styles(): CSSResult {
    return styles;
  }
}
