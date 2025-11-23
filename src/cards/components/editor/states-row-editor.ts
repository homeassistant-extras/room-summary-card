import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { StateConfig, ThresholdConfig } from '@type/config/entity';
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
    'thresholds-value-changed': {
      value: ThresholdConfig[];
    };
  }
}

export class RoomSummaryStatesRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public states?: StateConfig[];

  @property({ attribute: false }) public thresholds?: ThresholdConfig[];

  @property() public label?: string;

  @property() public entityId?: string;

  @property() public mode: 'states' | 'thresholds' = 'states';

  @property({ type: Boolean }) public isSensor = false;

  @property({ type: Boolean }) public isMainEntity = false;

  @state() private _expandedStates = new Set<number>();

  private _getKey(item: StateConfig | ThresholdConfig, index: number): string {
    // Use index as key to maintain stable identity during editing
    // This prevents focus loss when typing in form fields
    return `${this.mode}-${index}`;
  }

  private _getStateSchema = memoizeOne(
    (
      entity_id: string,
      hass: HomeAssistant,
      isSensor: boolean,
      isMainEntity: boolean,
    ): HaFormSchema[] => {
      const schema: HaFormSchema[] = [
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
      ];

      // Only include title_color for main entity (not sensors, not entities list)
      if (!isSensor && isMainEntity) {
        schema.push({
          name: 'title_color',
          required: false,
          label: 'editor.entity.state.title_color',
          selector: { ui_color: {} },
        });
      }

      schema.push(
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
      );

      return schema;
    },
  );

  private _getThresholdSchema = memoizeOne(
    (entity_id: string, hass: HomeAssistant): HaFormSchema[] => {
      return [
        {
          name: 'threshold',
          required: true,
          label: 'editor.entity.threshold.threshold',
          selector: { number: { mode: 'box' as const } },
        },
        {
          name: 'icon_color',
          required: true,
          label: 'editor.entity.threshold.icon_color',
          selector: { ui_color: {} },
        },
        {
          name: 'title_color',
          required: false,
          label: 'editor.entity.threshold.title_color',
          selector: { ui_color: {} },
        },
        {
          name: 'operator',
          required: false,
          label: 'editor.entity.threshold.operator',
          selector: {
            select: {
              mode: 'dropdown' as const,
              options: [
                {
                  value: 'gt',
                  label: localize(
                    hass,
                    'editor.threshold.operator.greater_than',
                  ),
                },
                {
                  value: 'gte',
                  label: localize(
                    hass,
                    'editor.threshold.operator.greater_than_or_equal',
                  ),
                },
                {
                  value: 'lt',
                  label: localize(hass, 'editor.threshold.operator.less_than'),
                },
                {
                  value: 'lte',
                  label: localize(
                    hass,
                    'editor.threshold.operator.less_than_or_equal',
                  ),
                },
                {
                  value: 'eq',
                  label: localize(hass, 'editor.threshold.operator.equal'),
                },
              ],
            },
          },
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'icon',
              label: 'editor.entity.threshold.icon',
              required: false,
              selector: { icon: {} },
            },
            {
              name: 'label',
              label: 'editor.entity.threshold.label',
              required: false,
              selector: { text: {} },
            },
          ],
        },
        {
          name: 'attribute',
          label: 'editor.entity.threshold.attribute',
          required: false,
          selector: { attribute: { entity_id } },
        },
        {
          name: 'styles',
          label: 'editor.entity.threshold.styles',
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

  private _addItem(): void {
    if (this.mode === 'states') {
      const newState = {
        state: '',
      } as any as StateConfig;
      const newStates = [...(this.states || []), newState];
      const newIndex = newStates.length - 1;
      this._expandedStates = new Set([...this._expandedStates, newIndex]);
      fireEvent(this, 'states-value-changed', { value: newStates });
    } else {
      const newThreshold = {
        threshold: 0,
      } as any as ThresholdConfig;
      const newThresholds = [...(this.thresholds || []), newThreshold];
      const newIndex = newThresholds.length - 1;
      this._expandedStates = new Set([...this._expandedStates, newIndex]);
      fireEvent(this, 'thresholds-value-changed', { value: newThresholds });
    }
  }

  /**
   * Adjusts expanded state indices after removing an item at the specified index.
   * Indices greater than the removed index are decremented by 1.
   */
  private _adjustExpandedIndicesAfterRemoval(
    removedIndex: number,
  ): Set<number> {
    const newExpanded = new Set(this._expandedStates);
    newExpanded.delete(removedIndex);

    const adjustedExpanded = new Set<number>();
    for (const idx of newExpanded) {
      if (idx > removedIndex) {
        adjustedExpanded.add(idx - 1);
      } else {
        adjustedExpanded.add(idx);
      }
    }
    return adjustedExpanded;
  }

  /**
   * Removes a state item at the specified index and fires the appropriate event.
   */
  private _removeStateItem(index: number): void {
    const newStates = (this.states || []).concat();
    newStates.splice(index, 1);
    this._expandedStates = this._adjustExpandedIndicesAfterRemoval(index);
    // Always ensure we send an array, even if empty
    fireEvent(this, 'states-value-changed', {
      value: newStates.length > 0 ? newStates : [],
    });
  }

  /**
   * Removes a threshold item at the specified index and fires the appropriate event.
   */
  private _removeThresholdItem(index: number): void {
    const newThresholds = (this.thresholds || []).concat();
    newThresholds.splice(index, 1);
    this._expandedStates = this._adjustExpandedIndicesAfterRemoval(index);
    // Always ensure we send an array, even if empty
    fireEvent(this, 'thresholds-value-changed', {
      value: newThresholds.length > 0 ? newThresholds : [],
    });
  }

  private _removeItem(index: number): void {
    if (this.mode === 'states') {
      this._removeStateItem(index);
    } else {
      this._removeThresholdItem(index);
    }
  }

  /**
   * Removes empty string properties from a config object
   */
  private _cleanEmptyStrings(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip empty strings
      if (value === '') continue;
      // Recursively clean nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const cleanedValue = this._cleanEmptyStrings(value);
        if (Object.keys(cleanedValue).length > 0) {
          cleaned[key] = cleanedValue;
        }
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => this._cleanEmptyStrings(item));
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  private _itemValueChanged(index: number, ev: CustomEvent): void {
    if (this.mode === 'states') {
      const newStates = (this.states || []).concat();
      const updatedState = ev.detail.value;
      // Ensure we have valid state before updating
      if (updatedState && typeof updatedState === 'object') {
        // Clean empty strings from the state config
        const cleanedState = this._cleanEmptyStrings(updatedState);
        newStates[index] = cleanedState;
      }
      // Always ensure we send an array
      fireEvent(this, 'states-value-changed', { value: newStates });
    } else {
      const newThresholds = (this.thresholds || []).concat();
      const updatedThreshold = ev.detail.value;
      // Ensure we have valid threshold before updating
      if (updatedThreshold && typeof updatedThreshold === 'object') {
        // Clean empty strings from the threshold config
        const cleanedThreshold = this._cleanEmptyStrings(updatedThreshold);
        newThresholds[index] = cleanedThreshold;
      }
      // Always ensure we send an array
      fireEvent(this, 'thresholds-value-changed', { value: newThresholds });
    }
  }

  private _getItemTitle(item: StateConfig | ThresholdConfig): string {
    if (this.mode === 'states') {
      const state = item as StateConfig;
      if (state.label) {
        return `${state.state} (${state.label})`;
      }
      return state.state || 'New State';
    } else {
      const threshold = item as ThresholdConfig;
      if (threshold.label) {
        return `${threshold.threshold} (${threshold.label})`;
      }
      return threshold.threshold?.toString() || 'New Threshold';
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    const entityId = this.entityId || '';

    const defaultLabel =
      this.mode === 'states'
        ? localize(this.hass, 'editor.entity.states')
        : localize(this.hass, 'editor.entity.thresholds');
    const addButtonLabel =
      this.mode === 'states'
        ? localize(this.hass, 'editor.entity.add_state')
        : localize(this.hass, 'editor.entity.add_threshold');

    const renderItems = () => {
      if (this.mode === 'states') {
        const states = Array.isArray(this.states) ? this.states : [];
        return repeat(
          states,
          (item, index) => this._getKey(item, index),
          (item, index) => {
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
                  <div class="state-title">${this._getItemTitle(item)}</div>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      'ui.components.entity.entity-picker.clear',
                    )}
                    class="remove-icon"
                    .index=${index}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._removeItem(index);
                    }}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="state-content">
                  <ha-form
                    .hass=${this.hass}
                    .data=${item}
                    .schema=${this._getStateSchema(
                      entityId,
                      this.hass!,
                      this.isSensor,
                      this.isMainEntity,
                    )}
                    .computeLabel=${this._computeLabelCallback}
                    @value-changed=${(ev: CustomEvent) =>
                      this._itemValueChanged(index, ev)}
                  ></ha-form>
                </div>
              </ha-expansion-panel>
            `;
          },
        );
      } else {
        const thresholds = Array.isArray(this.thresholds)
          ? this.thresholds
          : [];
        return repeat(
          thresholds,
          (item, index) => this._getKey(item, index),
          (item, index) => {
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
                  <div class="state-title">${this._getItemTitle(item)}</div>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      'ui.components.entity.entity-picker.clear',
                    )}
                    class="remove-icon"
                    .index=${index}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._removeItem(index);
                    }}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="state-content">
                  <ha-form
                    .hass=${this.hass}
                    .data=${item}
                    .schema=${this._getThresholdSchema(entityId, this.hass!)}
                    .computeLabel=${this._computeLabelCallback}
                    @value-changed=${(ev: CustomEvent) =>
                      this._itemValueChanged(index, ev)}
                  ></ha-form>
                </div>
              </ha-expansion-panel>
            `;
          },
        );
      }
    };

    return html`
      <label>
        ${this.label || defaultLabel}
        (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})
      </label>
      <div class="states">${renderItems()}</div>
      <mwc-button class="add-state" outlined @click=${this._addItem}>
        <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
        ${addButtonLabel}
      </mwc-button>
    `;
  }

  static override styles: CSSResult = css`
    :host {
      margin-bottom: 20px;
      display: block;
    }

    label {
      display: block;
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
      cursor: pointer;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-states-row-editor': RoomSummaryStatesRowEditor;
  }
}
