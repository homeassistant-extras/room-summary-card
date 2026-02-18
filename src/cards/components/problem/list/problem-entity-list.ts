// problem-entity-row is imported dynamically
import '@cards/components/problem/row/problem-entity-row';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { localize } from '@localize/localize';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { d } from '@util/debug';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styles } from './styles';

/**
 * Problem Entity List Component
 *
 * Renders a list of problem entities in the dialog.
 * Shows empty state when no problems exist.
 */
@customElement('problem-entity-list')
export class ProblemEntityList extends HassUpdateMixin(LitElement) {
  /**
   * Card config for debug (optional)
   */
  config?: Config;

  /**
   * Array of problem entity states
   */
  @property({ type: Array })
  entities: EntityState[] = [];

  /**
   * Renders the component
   */
  override render(): TemplateResult | typeof nothing {
    d(this.config, 'problem-entity-list', 'render');
    if (!this.hass) {
      return nothing;
    }

    if (this.entities.length === 0) {
      return html`
        <div class="empty-state">
          <p>${localize(this.hass, 'card.component.problem.no_problems')}</p>
        </div>
      `;
    }

    return html`
      <div class="problem-entity-list">
        ${repeat(
          this.entities,
          (entity) => entity.entity_id,
          (entity) => html`
            <problem-entity-row
              .entity=${entity}
              .hass=${this.hass}
              .config=${this.config}
            ></problem-entity-row>
          `,
        )}
      </div>
    `;
  }

  static override get styles(): CSSResult {
    return styles;
  }
}
