import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { BadgeConfig } from '@type/config/entity';
import {
  css,
  html,
  LitElement,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './states-row-editor';
import {
  badgeValueChanged,
  badgeStatesValueChanged,
} from './utils/badge-editor-handlers';
import {
  addBadge,
  adjustExpandedIndicesAfterRemoval,
  removeBadgeItem,
} from './utils/badge-editor-manager';
import {
  getBadgeSchema,
  computeLabelCallback,
} from './utils/badge-editor-schema';
import { getKey, getBadgeTitle } from './utils/badge-editor-utils';

declare global {
  interface HASSDomEvents {
    'badges-value-changed': {
      value: BadgeConfig[];
    };
  }
}

export class RoomSummaryBadgeRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public badges?: BadgeConfig[];

  @property() public label?: string;

  @property() public entityId?: string;

  @state() private _expandedBadges = new Set<number>();

  private _addBadge(): void {
    const newBadges = addBadge(this.badges);
    const newIndex = newBadges.length - 1;
    this._expandedBadges = new Set([...this._expandedBadges, newIndex]);
    fireEvent(this, 'badges-value-changed', { value: newBadges });
  }

  private _removeBadgeItem(index: number): void {
    const newBadges = removeBadgeItem(this.badges, index);
    this._expandedBadges = adjustExpandedIndicesAfterRemoval(
      this._expandedBadges,
      index,
    );
    fireEvent(this, 'badges-value-changed', { value: newBadges });
  }

  private _badgeValueChanged(index: number, ev: CustomEvent): void {
    const newBadges = badgeValueChanged(
      this.badges,
      index,
      ev.detail.value,
    );
    fireEvent(this, 'badges-value-changed', { value: newBadges });
  }

  private _badgeStatesValueChanged(index: number, ev: CustomEvent): void {
    const newBadges = badgeStatesValueChanged(
      this.badges,
      index,
      ev.detail.value,
    );
    fireEvent(this, 'badges-value-changed', { value: newBadges });
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    const entityId = this.entityId || '';
    const badges = Array.isArray(this.badges) ? this.badges : [];
    const maxBadges = 4;
    const canAddMore = badges.length < maxBadges;

    const defaultLabel =
      localize(this.hass, 'editor.entity.badges') || 'Badges';
    const addButtonLabel =
      localize(this.hass, 'editor.entity.add_badge') || 'Add Badge';

    return html`
      <label>
        ${this.label || defaultLabel}
        (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})
      </label>
      <div class="badges">
        ${repeat(
          badges,
          (item, index) => getKey(item, index),
          (item, index) => {
            const isExpanded = this._expandedBadges.has(index);
            const badgeEntityId = item.entity_id || entityId;
            return html`
              <ha-expansion-panel
                .expanded=${isExpanded}
                @expanded-changed=${(ev: CustomEvent) => {
                  if (ev.detail.value) {
                    this._expandedBadges = new Set([
                      ...this._expandedBadges,
                      index,
                    ]);
                  } else {
                    const newExpanded = new Set(this._expandedBadges);
                    newExpanded.delete(index);
                    this._expandedBadges = newExpanded;
                  }
                }}
              >
                <div slot="header" class="badge-header">
                  <div class="badge-title">
                    ${getBadgeTitle(item)}
                  </div>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      'ui.components.entity.entity-picker.clear',
                    )}
                    class="remove-icon"
                    .index=${index}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._removeBadgeItem(index);
                    }}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="badge-content">
                  ${this.hass
                    ? html`
                        <ha-form
                          .hass=${this.hass}
                          .data=${item}
                          .schema=${getBadgeSchema(entityId, this.hass)}
                          .computeLabel=${(schema: HaFormSchema) =>
                            computeLabelCallback(schema, this.hass!)}
                          @value-changed=${(ev: CustomEvent) =>
                            this._badgeValueChanged(index, ev)}
                        ></ha-form>
                      `
                    : nothing}
                  ${(() => {
                    if (!item.mode) {
                      const statesEditor = this.hass
                        ? html`
                            <room-summary-states-row-editor
                              .hass=${this.hass}
                              .states=${item.states}
                              .entityId=${badgeEntityId}
                              .mode=${'states'}
                              .isSensor=${false}
                              .isMainEntity=${false}
                              label=${localize(
                                this.hass,
                                'editor.entity.states',
                              )}
                              @states-value-changed=${(ev: CustomEvent) =>
                                this._badgeStatesValueChanged(index, ev)}
                            ></room-summary-states-row-editor>
                          `
                        : nothing;
                      return statesEditor;
                    }
                    return nothing;
                  })()}
                </div>
              </ha-expansion-panel>
            `;
          },
        )}
      </div>
      ${canAddMore
        ? html`
            <mwc-button class="add-badge" outlined @click=${this._addBadge}>
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              ${addButtonLabel}
            </mwc-button>
          `
        : html`
            <div class="max-badges-message">
              ${localize(this.hass, 'editor.badge.max_badges') ||
              `Maximum ${maxBadges} badges allowed`}
            </div>
          `}
    `;
  }

  static override readonly styles: CSSResult = css`
    :host {
      margin-bottom: 20px;
      display: block;
    }

    label {
      display: block;
    }

    .badges {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    ha-expansion-panel {
      --expansion-panel-summary-padding: 12px 16px;
      --expansion-panel-content-padding: 0;
    }

    .badge-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .badge-title {
      flex-grow: 1;
      font-weight: 500;
    }

    .remove-icon {
      --mdc-icon-button-size: 32px;
      color: var(--secondary-text-color);
      margin-left: 8px;
    }

    .badge-content {
      padding: 16px;
    }

    .add-badge {
      cursor: pointer;
    }

    .max-badges-message {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      padding: 8px;
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-badge-row-editor': RoomSummaryBadgeRowEditor;
  }
}
