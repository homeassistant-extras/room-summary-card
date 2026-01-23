import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { fireEvent } from '@hass/common/dom/fire_event';
// more-info-mixin is now compiled
import { computeEntityName } from '@hass/common/entity/compute_entity_name';
import { stateActive } from '@hass/common/entity/state_active';
import '@hass/state/more-info-mixin';
import { stateDisplay } from '@html/state-display';
import { localize } from '@localize/localize';
import type { EntityState } from '@type/room';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';

/**
 * Problem Entity Row Component
 *
 * Renders a single problem entity row in the problem dialog.
 * Shows entity icon, name, state, and active/inactive indicator.
 */
@customElement('problem-entity-row')
export class ProblemEntityRow extends HassUpdateMixin(LitElement) {
  /**
   * The problem entity state
   */
  @property({ type: Object })
  entity!: EntityState;

  /**
   * Handles click on entity row to open more-info dialog
   */
  private _handleClick(): void {
    fireEvent(this, 'hass-more-info', {
      entityId: this.entity.entity_id,
    });
  }

  /**
   * Renders the component
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.entity || !this.hass) {
      return nothing;
    }

    const isActive = stateActive(this.entity);
    const displayName =
      computeEntityName(this.entity, this.hass) || this.entity.entity_id;

    return html`
      <div
        class="problem-entity-row ${isActive ? 'active' : 'inactive'}"
        @click=${this._handleClick}
      >
        <ha-state-icon
          .hass=${this.hass}
          .stateObj=${this.entity}
        ></ha-state-icon>
        <div class="entity-info">
          <div class="entity-name">${displayName}</div>
          <div class="entity-state">
            ${stateDisplay(this.hass, this.entity)}
          </div>
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
