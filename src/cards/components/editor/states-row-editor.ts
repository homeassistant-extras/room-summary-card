import { localize } from '@/localize/localize';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { StateConfig } from '@type/config/entity';
import type { TranslationKey } from '@type/locale';
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
import memoizeOne from 'memoize-one';

declare global {
  interface HASSDomEvents {
    'states-value-changed': {
      value: StateConfig[];
    };
  }
}

export class RoomSummaryStatesRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public states?: StateConfig[];

  @property() public label?: string;

  @property() public entityId?: string;

  @state() private _expandedStates = new Set<number>();

  private _getKey(state: StateConfig, index: number): string {
    // Use index as key to maintain stable identity during editing
    // This prevents focus loss when typing in form fields
    return `state-${index}`;
  }

  private _getStateSchema = memoizeOne(
    (entity_id: string, hass: HomeAssistant): HaFormSchema[] => {
      return [
        {
          name: 'state',
          required: true,
          label: 'editor.entity.state.state',
          selector: { text: {} },
        },
        {
          name: 'icon_color',
          required: true,
          label: 'editor.entity.state.icon_color',
          selector: { ui_color: {} },
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'icon',
              label: 'editor.entity.state.icon',
              required: false,
              selector: { icon: {} },
            },
            {
              name: 'label',
              label: 'editor.entity.state.label',
              required: false,
              selector: { text: {} },
            },
          ],
        },
        {
          name: 'attribute',
          label: 'editor.entity.state.attribute',
          required: false,
          selector: { attribute: { entity_id } },
        },
        {
          name: 'styles',
          label: 'editor.entity.state.styles',
          required: false,
          selector: { object: {} },
        },
      ];
    },
  );

  private _computeLabelCallback = (schema: HaFormSchema): string => {
    if (!schema.label) return '';
    return `${localize(this.hass as any, schema.label as TranslationKey)} ${
      schema.required
        ? `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.required')})`
        : `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`
    }`;
  };

  private _toggleExpanded(index: number): void {
    const newExpanded = new Set(this._expandedStates);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    this._expandedStates = newExpanded;
  }

  private _addState(): void {
    const newState: StateConfig = {
      state: '',
      icon_color: '',
    };
    const newStates = [...(this.states || []), newState];
    const newIndex = newStates.length - 1;
    this._expandedStates = new Set([...this._expandedStates, newIndex]);
    fireEvent(this, 'states-value-changed', { value: newStates });
  }

  private _removeState(index: number): void {
    const newStates = (this.states || []).concat();
    newStates.splice(index, 1);
    const newExpanded = new Set(this._expandedStates);
    newExpanded.delete(index);
    // Adjust expanded indices after removal
    const adjustedExpanded = new Set<number>();
    for (const idx of newExpanded) {
      if (idx > index) {
        adjustedExpanded.add(idx - 1);
      } else {
        adjustedExpanded.add(idx);
      }
    }
    this._expandedStates = adjustedExpanded;
    // Always ensure we send an array, even if empty
    fireEvent(this, 'states-value-changed', {
      value: newStates.length > 0 ? newStates : [],
    });
  }

  private _stateValueChanged(index: number, ev: CustomEvent): void {
    const newStates = (this.states || []).concat();
    const updatedState = ev.detail.value;
    // Ensure we have valid state and icon_color before updating
    if (updatedState && typeof updatedState === 'object') {
      newStates[index] = updatedState;
    }
    // Always ensure we send an array
    fireEvent(this, 'states-value-changed', { value: newStates });
  }

  private _getStateTitle(state: StateConfig): string {
    if (state.label) {
      return `${state.state} (${state.label})`;
    }
    return state.state || 'New State';
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    // Ensure states is always an array, never an object
    const states = Array.isArray(this.states) ? this.states : [];
    const entityId = this.entityId || '';

    return html`
      <label>
        ${this.label ||
        `${localize(this.hass, 'editor.entity.states')} (${this.hass.localize(
          'ui.panel.lovelace.editor.card.config.optional',
        )})`}
      </label>
      <div class="states">
        ${repeat(
          states,
          (state, index) => this._getKey(state, index),
          (state, index) => {
            const isExpanded = this._expandedStates.has(index);
            return html`
              <ha-expansion-panel
                .expanded=${isExpanded}
                @expanded-changed=${(ev: CustomEvent) => {
                  if (ev.detail.value) {
                    this._expandedStates = new Set([
                      ...this._expandedStates,
                      index,
                    ]);
                  } else {
                    const newExpanded = new Set(this._expandedStates);
                    newExpanded.delete(index);
                    this._expandedStates = newExpanded;
                  }
                }}
              >
                <div slot="header" class="state-header">
                  <div class="state-title">${this._getStateTitle(state)}</div>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      'ui.components.entity.entity-picker.clear',
                    )}
                    class="remove-icon"
                    .index=${index}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._removeState(index);
                    }}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="state-content">
                  <ha-form
                    .hass=${this.hass}
                    .data=${state}
                    .schema=${this._getStateSchema(entityId, this.hass!)}
                    .computeLabel=${this._computeLabelCallback}
                    @value-changed=${(ev: CustomEvent) =>
                      this._stateValueChanged(index, ev)}
                  ></ha-form>
                </div>
              </ha-expansion-panel>
            `;
          },
        )}
      </div>
      <mwc-button class="add-state" outlined @click=${this._addState}>
        <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
        ${this.hass
          ? localize(this.hass, 'editor.entity.add_state')
          : 'Add State'}
      </mwc-button>
    `;
  }

  static override styles: CSSResult = css`
    label {
      display: block;
      margin-bottom: 8px;
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .states {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    ha-expansion-panel {
      --expansion-panel-summary-padding: 12px 16px;
      --expansion-panel-content-padding: 0;
    }

    .state-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .state-title {
      flex-grow: 1;
      font-weight: 500;
    }

    .remove-icon {
      --mdc-icon-button-size: 32px;
      color: var(--secondary-text-color);
      margin-left: 8px;
    }

    .state-content {
      padding: 16px;
    }

    .add-state {
      padding: 16px 0;
      cursor: pointer;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-states-row-editor': RoomSummaryStatesRowEditor;
  }
}
