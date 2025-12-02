import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { ThresholdEntry } from '@type/config';
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
    'threshold-entries-value-changed': {
      value: ThresholdEntry[];
    };
  }
}

export class RoomSummaryThresholdsRowEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public thresholds?: ThresholdEntry[];

  @property() public label?: string;

  @property() public thresholdType: 'temperature' | 'humidity' = 'temperature';

  @property({ attribute: false }) public availableEntities?: string[];

  @state() private _expandedThresholds = new Set<number>();

  private _getKey(item: ThresholdEntry, index: number): string {
    return `threshold-${this.thresholdType}-${index}`;
  }

  private readonly _getThresholdSchema = memoizeOne(
    (
      hass: HomeAssistant,
      thresholdType: 'temperature' | 'humidity',
      availableEntities: string[],
    ): HaFormSchema[] => {
      const isTemperature = thresholdType === 'temperature';
      const entityFilter = isTemperature
        ? { device_class: 'temperature' }
        : { device_class: 'humidity' };

      return [
        {
          name: 'entity_id',
          label: isTemperature
            ? 'editor.threshold.temperature_entity'
            : 'editor.threshold.humidity_entity',
          required: false,
          selector: {
            entity: {
              multiple: false,
              include_entities: availableEntities,
              filter: entityFilter,
            },
          },
        },
        {
          name: 'value',
          label: isTemperature
            ? 'editor.threshold.temperature_threshold'
            : 'editor.threshold.humidity_threshold',
          required: false,
          selector: isTemperature
            ? { number: { mode: 'box' as const, unit_of_measurement: '°' } }
            : {
                number: {
                  mode: 'slider' as const,
                  unit_of_measurement: '%',
                  min: 0,
                  max: 100,
                },
              },
        },
        {
          name: 'operator',
          label: isTemperature
            ? 'editor.threshold.temperature_operator'
            : 'editor.threshold.humidity_operator',
          required: false,
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
      ];
    },
  );

  private readonly _computeLabelCallback = (schema: HaFormSchema): string => {
    if (!schema.label) return '';
    return `${localize(this.hass as any, schema.label as TranslationKey)} ${
      schema.required
        ? `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.required')})`
        : `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`
    }`;
  };

  private _addThreshold(): void {
    const newThreshold: ThresholdEntry = {};
    const newThresholds = [...(this.thresholds || []), newThreshold];
    const newIndex = newThresholds.length - 1;
    this._expandedThresholds = new Set([...this._expandedThresholds, newIndex]);
    fireEvent(this, 'threshold-entries-value-changed', {
      value: newThresholds,
    });
  }

  private _adjustExpandedIndicesAfterRemoval(
    removedIndex: number,
  ): Set<number> {
    const newExpanded = new Set(this._expandedThresholds);
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

  private _removeThresholdItem(index: number): void {
    const newThresholds = (this.thresholds || []).concat();
    newThresholds.splice(index, 1);
    this._expandedThresholds = this._adjustExpandedIndicesAfterRemoval(index);
    fireEvent(this, 'threshold-entries-value-changed', {
      value: newThresholds.length > 0 ? newThresholds : [],
    });
  }

  private _cleanEmptyStrings(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === '') continue;
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

  private _thresholdValueChanged(index: number, ev: CustomEvent): void {
    const newThresholds = (this.thresholds || []).concat();
    const updatedThreshold = ev.detail.value;
    if (updatedThreshold && typeof updatedThreshold === 'object') {
      const cleanedThreshold = this._cleanEmptyStrings(updatedThreshold);
      newThresholds[index] = cleanedThreshold;
    }
    fireEvent(this, 'threshold-entries-value-changed', {
      value: newThresholds,
    });
  }

  private _getThresholdTitle(item: ThresholdEntry): string {
    if (item.entity_id && item.value) {
      return `${item.entity_id}: ${item.value}`;
    }
    if (item.value) {
      return item.value.toString();
    }
    if (item.entity_id) {
      return item.entity_id;
    }
    return 'New Threshold';
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hass) {
      return nothing;
    }

    const defaultLabel =
      this.thresholdType === 'temperature'
        ? this.hass.localize('editor.threshold.temperature_thresholds') ||
          'Temperature Thresholds'
        : this.hass.localize('editor.threshold.humidity_thresholds') ||
          'Humidity Thresholds';
    const addButtonLabel =
      this.thresholdType === 'temperature'
        ? this.hass.localize('editor.threshold.add_temperature_threshold') ||
          'Add Temperature Threshold'
        : this.hass.localize('editor.threshold.add_humidity_threshold') ||
          'Add Humidity Threshold';

    const thresholds = Array.isArray(this.thresholds) ? this.thresholds : [];

    return html`
      <label>
        ${this.label || defaultLabel}
        (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})
      </label>
      <div class="thresholds">
        ${repeat(
          thresholds,
          (item, index) => this._getKey(item, index),
          (item, index) => {
            const isExpanded = this._expandedThresholds.has(index);
            return html`
              <ha-expansion-panel
                .expanded=${isExpanded}
                @expanded-changed=${(ev: CustomEvent) => {
                  if (ev.detail.value) {
                    this._expandedThresholds = new Set([
                      ...this._expandedThresholds,
                      index,
                    ]);
                  } else {
                    const newExpanded = new Set(this._expandedThresholds);
                    newExpanded.delete(index);
                    this._expandedThresholds = newExpanded;
                  }
                }}
              >
                <div slot="header" class="threshold-header">
                  <div class="threshold-title">
                    ${this._getThresholdTitle(item)}
                  </div>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      'ui.components.entity.entity-picker.clear',
                    )}
                    class="remove-icon"
                    .index=${index}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._removeThresholdItem(index);
                    }}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </ha-icon-button>
                </div>
                <div class="threshold-content">
                  <ha-form
                    .hass=${this.hass}
                    .data=${item}
                    .schema=${this.hass
                      ? this._getThresholdSchema(
                          this.hass,
                          this.thresholdType,
                          this.availableEntities || [],
                        )
                      : []}
                    .computeLabel=${this._computeLabelCallback}
                    @value-changed=${(ev: CustomEvent) =>
                      this._thresholdValueChanged(index, ev)}
                  ></ha-form>
                </div>
              </ha-expansion-panel>
            `;
          },
        )}
      </div>
      <mwc-button class="add-threshold" outlined @click=${this._addThreshold}>
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

    .thresholds {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    ha-expansion-panel {
      --expansion-panel-summary-padding: 12px 16px;
      --expansion-panel-content-padding: 0;
    }

    .threshold-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .threshold-title {
      flex-grow: 1;
      font-weight: 500;
    }

    .remove-icon {
      --mdc-icon-button-size: 32px;
      color: var(--secondary-text-color);
      margin-left: 8px;
    }

    .threshold-content {
      padding: 16px;
    }

    .add-threshold {
      cursor: pointer;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-thresholds-row-editor': RoomSummaryThresholdsRowEditor;
  }
}
