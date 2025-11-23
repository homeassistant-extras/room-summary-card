import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { UiAction } from '@hass/panels/lovelace/editor/hui-element-editor';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { EntityConfig } from '@type/config/entity';
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
import memoizeOne from 'memoize-one';
import './states-row-editor';

export class RoomSummaryEntityDetailEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityConfig;

  @property({ attribute: false }) public type: 'entity' | 'sensor' = 'entity';

  @property({ type: Boolean }) public isMainEntity = false;

  public setConfig(config: EntityConfig | string): void {
    if (typeof config === 'string') {
      this._config = { entity_id: config };
    } else {
      this._config = { ...config };
    }
  }

  @property({ attribute: false })
  public set value(value: EntityConfig | string | undefined) {
    if (!value) {
      this._config = undefined;
      return;
    }
    this.setConfig(value);
  }

  public get value(): EntityConfig | undefined {
    return this._config;
  }

  private _entitiesSchema = memoizeOne(
    (entity_id: string, hass: HomeAssistant): HaFormSchema[] => {
      return [
        {
          name: 'entity_id',
          required: true,
          label: 'editor.entity.entity_id',
          selector: { entity: {} },
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'label',
              label: 'editor.entity.entity_label',
              selector: { text: {} },
            },
            {
              name: 'attribute',
              label: 'editor.entity.entity_attribute',
              selector: { attribute: { entity_id } },
            },
            {
              name: 'icon',
              label: 'editor.entity.entity_icon',
              selector: {
                icon: {},
              },
            },
          ],
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'on_color',
              label: 'editor.entity.entity_on_color',
              selector: { ui_color: {} },
            },
            {
              name: 'off_color',
              label: 'editor.entity.entity_off_color',
              selector: { ui_color: {} },
            },
          ],
        },
        {
          name: 'features',
          label: 'editor.features.features',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: localize(hass, 'editor.entity.use_entity_icon'),
                  value: 'use_entity_icon',
                },
              ],
            },
          },
        },
        {
          name: 'interactions',
          label: 'editor.interactions.interactions',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:gesture-tap',
          schema: [
            {
              name: 'tap_action',
              label: 'editor.interactions.tap_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'toggle' as UiAction,
                },
              },
            },
            {
              name: 'double_tap_action',
              label: 'editor.interactions.double_tap_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'more-info' as UiAction,
                },
              },
            },
            {
              name: 'hold_action',
              label: 'editor.interactions.hold_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'none' as UiAction,
                },
              },
            },
          ],
        },
        {
          name: 'styles',
          label: 'editor.styles.css_styles',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:brush-variant',
          schema: [
            {
              name: 'styles',
              label: 'editor.entity.styles',
              required: false,
              selector: { object: {} },
            },
          ],
        },
      ];
    },
  );

  private _sensorsSchema = memoizeOne(
    (entity_id: string, hass: HomeAssistant): HaFormSchema[] => {
      return [
        {
          name: 'entity_id',
          required: true,
          label: 'editor.entity.entity_id',
          selector: { entity: {} },
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'label',
              label: 'editor.entity.entity_label',
              selector: { text: {} },
            },
            {
              name: 'attribute',
              label: 'editor.entity.entity_attribute',
              selector: { attribute: { entity_id } },
            },
          ],
        },
      ];
    },
  );

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const schema =
      this.type === 'entity'
        ? this._entitiesSchema(this._config.entity_id, this.hass)
        : this._sensorsSchema(this._config.entity_id, this.hass);

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
      ${this._config.entity_id
        ? html`
            <room-summary-states-row-editor
              .hass=${this.hass}
              .states=${Array.isArray(this._config.states)
                ? this._config.states
                : undefined}
              .entityId=${this._config.entity_id}
              .mode=${'states'}
              .isSensor=${this.type === 'sensor'}
              .isMainEntity=${this.isMainEntity}
              label=${localize(this.hass, 'editor.entity.states')}
              @states-value-changed=${this._statesValueChanged}
            ></room-summary-states-row-editor>
            ${this.type === 'entity'
              ? html`
                  <room-summary-states-row-editor
                    .hass=${this.hass}
                    .thresholds=${Array.isArray(this._config.thresholds)
                      ? this._config.thresholds
                      : undefined}
                    .entityId=${this._config.entity_id}
                    .mode=${'thresholds'}
                    label=${localize(this.hass, 'editor.entity.thresholds')}
                    @thresholds-value-changed=${this._thresholdsValueChanged}
                  ></room-summary-states-row-editor>
                `
              : nothing}
          `
        : nothing}
    `;
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

  private _statesValueChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const statesValue = ev.detail.value;

    // Ensure states is always an array, never an object
    if (!Array.isArray(statesValue)) {
      console.warn('States value is not an array:', statesValue);
      return;
    }

    // Clean empty strings from each state config
    const cleanedStates = statesValue.map((state) =>
      this._cleanEmptyStrings(state),
    );

    const newConfig = {
      ...this._config,
      // Only set states if array has items, otherwise remove the property
      ...(cleanedStates.length > 0 ? { states: cleanedStates } : {}),
    };

    // If states array is empty, ensure we remove the property
    if (cleanedStates.length === 0 && 'states' in newConfig) {
      delete newConfig.states;
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _thresholdsValueChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const thresholdsValue = ev.detail.value;

    // Ensure thresholds is always an array, never an object
    if (!Array.isArray(thresholdsValue)) {
      console.warn('Thresholds value is not an array:', thresholdsValue);
      return;
    }

    // Clean empty strings from each threshold config
    const cleanedThresholds = thresholdsValue.map((threshold) =>
      this._cleanEmptyStrings(threshold),
    );

    const newConfig = {
      ...this._config,
      // Only set thresholds if array has items, otherwise remove the property
      ...(cleanedThresholds.length > 0
        ? { thresholds: cleanedThresholds }
        : {}),
    };

    // If thresholds array is empty, ensure we remove the property
    if (cleanedThresholds.length === 0 && 'thresholds' in newConfig) {
      delete newConfig.thresholds;
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _computeLabelCallback = (schema: HaFormSchema): string => {
    if (!schema.label) return '';
    return `${localize(this.hass as any, schema.label as TranslationKey)} ${
      schema.required
        ? `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.required')})`
        : `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`
    }`;
  };

  private _valueChanged(ev: CustomEvent): void {
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }

  static override styles: CSSResult = css`
    ha-form {
      padding: 16px;
    }
  `;
}
