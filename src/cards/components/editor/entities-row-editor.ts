import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config/entity';
import {
  css,
  html,
  LitElement,
  nothing,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

declare global {
  interface HASSDomEvents {
    'value-changed': {
      value: (EntityConfig | string)[] | string[];
    };
    'edit-detail-element': {
      subElementConfig: {
        index: number;
        type: 'entity' | 'sensor';
        elementConfig: EntityConfig | string;
        field: 'entities' | 'lights';
        isMainEntity?: boolean;
      };
    };
  }
}

type EntityRowItem = EntityConfig | string;

export class RoomSummaryEntitiesRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public entities?: EntityRowItem[];

  @property({ attribute: false }) public lights?: string[];

  @property() public label?: string;

  @property() public field: 'entities' | 'lights' = 'entities';

  @property({ type: Boolean }) public single = false;

  @property({ attribute: false }) public availableEntities?: string[];

  private _getKey(item: EntityRowItem, index: number): string {
    // Generate a stable key based on entity_id and index
    const entityId = typeof item === 'string' ? item : item.entity_id;
    return `${entityId}-${index}`;
  }

  private _getEntityId(item: EntityRowItem): string {
    if (typeof item === 'string') {
      return item;
    }
    return item.entity_id;
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    const items =
      this.field === 'entities' ? this.entities || [] : this.lights || [];

    return html`
      <label>
        ${this.label ||
        `${this.hass.localize(
          'ui.panel.lovelace.editor.card.generic.entities',
        )} (${this.hass.localize(
          'ui.panel.lovelace.editor.card.config.optional',
        )})`}
      </label>
      ${!this.single
        ? html`
            <ha-sortable
              handle-selector=".handle"
              @item-moved=${this._rowMoved}
            >
              <div class="entities">
                ${repeat(
                  items,
                  (item, index) => this._getKey(item, index),
                  (item, index) => html`
                    <div class="entity">
                      <div class="handle">
                        <ha-icon icon="mdi:drag"></ha-icon>
                      </div>
                      <ha-entity-picker
                        allow-custom-entity
                        hide-clear-icon
                        .hass=${this.hass}
                        .value=${this._getEntityId(item)}
                        .index=${index}
                        .includeEntities=${this.availableEntities}
                        @value-changed=${this._valueChanged}
                      ></ha-entity-picker>
                      <ha-icon-button
                        .label=${this.hass!.localize(
                          'ui.components.entity.entity-picker.clear',
                        )}
                        class="remove-icon"
                        .index=${index}
                        @click=${this._removeRow}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </ha-icon-button>
                      <ha-icon-button
                        .label=${this.hass!.localize(
                          'ui.components.entity.entity-picker.edit',
                        )}
                        class="edit-icon"
                        .index=${index}
                        @click=${this._editRow}
                      >
                        <ha-icon icon="mdi:pencil"></ha-icon>
                      </ha-icon-button>
                    </div>
                  `,
                )}
              </div>
            </ha-sortable>
          `
        : html`
            <div class="entities">
              ${repeat(
                items,
                (item, index) => this._getKey(item, index),
                (item, index) => html`
                  <div class="entity">
                    <ha-entity-picker
                      allow-custom-entity
                      hide-clear-icon
                      .hass=${this.hass}
                      .value=${this._getEntityId(item)}
                      .index=${index}
                      .includeEntities=${this.availableEntities}
                      @value-changed=${this._valueChanged}
                    ></ha-entity-picker>
                    <ha-icon-button
                      .label=${this.hass!.localize(
                        'ui.components.entity.entity-picker.clear',
                      )}
                      class="remove-icon"
                      .index=${index}
                      @click=${this._removeRow}
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                    <ha-icon-button
                      .label=${this.hass!.localize(
                        'ui.components.entity.entity-picker.edit',
                      )}
                      class="edit-icon"
                      .index=${index}
                      @click=${this._editRow}
                    >
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </ha-icon-button>
                  </div>
                `,
              )}
            </div>
          `}
      ${!this.single || items.length === 0
        ? html`
            <ha-entity-picker
              class="add-entity ${this.single ? 'single-mode' : ''}"
              .hass=${this.hass}
              .includeEntities=${this.availableEntities}
              @value-changed=${this._addEntity}
            ></ha-entity-picker>
          `
        : nothing}
    `;
  }

  private async _addEntity(ev: CustomEvent): Promise<void> {
    ev.stopPropagation(); // Stop the picker's event from bubbling up
    const value = ev.detail.value;
    if (value === '') {
      return;
    }

    // In single mode, replace instead of add
    if (this.single) {
      if (this.field === 'entities') {
        (ev.target as any).value = '';
        fireEvent(this, 'value-changed', { value: [value] });
      } else {
        (ev.target as any).value = '';
        fireEvent(this, 'value-changed', { value: [value] });
      }
      return;
    }

    if (this.field === 'entities') {
      const newConfigEntities = [...(this.entities || []), value];
      (ev.target as any).value = '';
      fireEvent(this, 'value-changed', { value: newConfigEntities });
    } else {
      const newConfigLights = [...(this.lights || []), value];
      (ev.target as any).value = '';
      fireEvent(this, 'value-changed', { value: newConfigLights });
    }
  }

  private _removeRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;

    if (this.field === 'entities') {
      const newConfigEntities = (this.entities || []).concat();
      newConfigEntities.splice(index, 1);
      fireEvent(this, 'value-changed', { value: newConfigEntities });
    } else {
      const newConfigLights = (this.lights || []).concat();
      newConfigLights.splice(index, 1);
      fireEvent(this, 'value-changed', { value: newConfigLights });
    }
  }

  private _valueChanged(ev: CustomEvent): void {
    const value = ev.detail.value;
    const index = (ev.target as any).index;

    if (this.field === 'entities') {
      const newConfigEntities = (this.entities || []).concat();
      if (value === '' || value === undefined) {
        newConfigEntities.splice(index, 1);
      } else {
        const currentItem = newConfigEntities[index];
        if (typeof currentItem === 'string') {
          newConfigEntities[index] = value;
        } else {
          newConfigEntities[index] = {
            ...currentItem,
            entity_id: value,
          };
        }
      }
      fireEvent(this, 'value-changed', { value: newConfigEntities });
    } else {
      const newConfigLights = (this.lights || []).concat();
      if (value === '' || value === undefined) {
        newConfigLights.splice(index, 1);
      } else {
        newConfigLights[index] = value;
      }
      fireEvent(this, 'value-changed', { value: newConfigLights });
    }
  }

  private _editRow(ev: CustomEvent): void {
    const index = (ev.currentTarget as any).index;
    const items =
      this.field === 'entities' ? this.entities || [] : this.lights || [];
    const elementConfig = items[index] as EntityConfig | string;

    fireEvent(this, 'edit-detail-element', {
      subElementConfig: {
        index,
        type: 'entity',
        elementConfig,
        field: this.field,
      },
    });
  }

  private _rowMoved(ev: CustomEvent): void {
    ev.stopPropagation();
    const { oldIndex, newIndex } = ev.detail;

    const items =
      this.field === 'entities' ? this.entities || [] : this.lights || [];
    const newItems = items.concat();

    const [movedItem] = newItems.splice(oldIndex, 1);
    if (movedItem !== undefined) {
      newItems.splice(newIndex, 0, movedItem);
      fireEvent(this, 'value-changed', { value: newItems });
    }
  }

  static override styles: CSSResult = css`
    ha-entity-picker {
      margin-top: 8px;
    }
    .add-entity {
      display: block;
      margin-left: 31px;
      margin-right: 71px;
      margin-inline-start: 31px;
      margin-inline-end: 71px;
      direction: var(--direction);
    }
    .add-entity.single-mode {
      margin-left: 0;
      margin-inline-start: 0;
    }
    .entities {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .entity {
      display: flex;
      align-items: center;
    }

    .entity .handle {
      padding-right: 8px;
      cursor: move; /* fallback if grab cursor is unsupported */
      cursor: grab;
      padding-inline-end: 8px;
      padding-inline-start: initial;
      direction: var(--direction);
    }
    .entity .handle > * {
      pointer-events: none;
    }

    .entity ha-entity-picker {
      flex-grow: 1;
      min-width: 0;
    }

    .remove-icon,
    .edit-icon {
      --mdc-icon-button-size: 36px;
      color: var(--secondary-text-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-entities-row-editor': RoomSummaryEntitiesRowEditor;
  }
}
