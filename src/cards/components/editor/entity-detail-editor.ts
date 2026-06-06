import { computeLabel } from '@editor/utils/compute-label';
import { fireEvent } from '@homeassistant-extras/hass/common/dom/fire_event';
import type { UiAction } from '@homeassistant-extras/hass/panels/lovelace/editor/hui-element-editor';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { localize, type LocalizedHaFormSchema } from '@localize/localize';
import type { EntityConfig } from '@type/config/entity';
import type { LightConfigObject } from '@type/config/light';
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
import './badge-row-editor';
import './states-row-editor';

export class RoomSummaryEntityDetailEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityConfig | LightConfigObject;

  @property({ attribute: false }) public type: 'entity' | 'sensor' | 'light' =
    'entity';

  @property({ type: Boolean }) public isMainEntity = false;

  public setConfig(config: EntityConfig | LightConfigObject | string): void {
    if (typeof config === 'string') {
      this._config = { entity_id: config };
    } else {
      this._config = { ...config };
    }
  }

  @property({ attribute: false })
  public set value(
    value: EntityConfig | LightConfigObject | string | undefined,
  ) {
    if (!value) {
      this._config = undefined;
      return;
    }
    this.setConfig(value);
  }

  public get value(): EntityConfig | LightConfigObject | undefined {
    return this._config;
  }

  private readonly _entitiesSchema = memoizeOne(
    (hass: HomeAssistant): LocalizedHaFormSchema[] => {
      return [
        {
          name: 'entity_id',
          required: true,
          label: 'editor.entity.entity_id',
          selector: { entity: {} },
        },
        {
          name: 'icon',
          label: 'editor.entity.entity_icon',
          selector: {
            icon: {},
          },
        },
        {
          name: 'label',
          label: 'editor.entity.entity_label',
          selector: { template: { preview: true } },
        },
        {
          name: 'attribute',
          label: 'editor.entity.entity_attribute',
          selector: {
            ui_state_content: {
              allow_context: true,
            },
          },
          context: {
            filter_entity: 'entity_id',
          },
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
                {
                  label: localize(hass, 'editor.entity.show_state'),
                  value: 'show_state',
                },
                {
                  label: localize(
                    hass,
                    'editor.entity.hide_zero_attribute_domains',
                  ),
                  value: 'hide_zero_attribute_domains',
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
        {
          name: 'slider',
          label: 'editor.entity.slider',
          type: 'expandable',
          icon: 'mdi:gauge',
          schema: [
            {
              name: 'style',
              label: 'editor.entity.slider_style',
              required: false,
              selector: {
                select: {
                  mode: 'dropdown' as const,
                  options: [
                    {
                      label: localize(hass, 'editor.entity.slider_style_bar'),
                      value: 'bar',
                    },
                    {
                      label: localize(hass, 'editor.entity.slider_style_ha'),
                      value: 'ha',
                    },
                  ],
                },
              },
            },
            {
              name: 'hide_icon',
              label: 'editor.entity.slider_hide_icon',
              required: false,
              selector: { boolean: {} },
            },
          ],
        },
      ];
    },
  );

  private readonly _sensorsSchema: LocalizedHaFormSchema[] = [
    {
      name: 'entity_id',
      required: true,
      label: 'editor.entity.entity_id',
      selector: { entity: {} },
    },
    {
      name: 'icon',
      label: 'editor.entity.entity_icon',
      selector: {
        icon: {},
      },
    },
    {
      name: 'label',
      label: 'editor.entity.entity_label',
      selector: { template: { preview: true } },
    },
    {
      name: 'attribute',
      label: 'editor.entity.entity_attribute',
      selector: {
        ui_state_content: {
          allow_context: true,
        },
      },
      context: {
        filter_entity: 'entity_id',
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
              default_action: 'more-info' as UiAction,
            },
          },
        },
        {
          name: 'double_tap_action',
          label: 'editor.interactions.double_tap_action',
          required: false,
          selector: {
            ui_action: {
              default_action: 'none' as UiAction,
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
  ];

  private readonly _lightsSchema = memoizeOne(
    (hass: HomeAssistant): LocalizedHaFormSchema[] => {
      return [
        {
          name: 'entity_id',
          required: true,
          label: 'editor.entity.entity_id',
          selector: {
            entity: {
              filter: { domain: ['light', 'switch'] },
            },
          },
        },
        {
          name: 'type',
          label: 'editor.light.type',
          required: false,
          selector: {
            select: {
              mode: 'dropdown' as const,
              options: [
                {
                  label: localize(hass, 'editor.light.ambient') || 'Ambient',
                  value: 'ambient',
                },
              ],
            },
          },
        },
      ];
    },
  );

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    let schema: LocalizedHaFormSchema[];
    if (this.type === 'entity') {
      schema = this._entitiesSchema(this.hass);
    } else if (this.type === 'sensor') {
      schema = this._sensorsSchema;
    } else {
      schema = this._lightsSchema(this.hass);
    }

    // Only access states/thresholds/badges for entity/sensor types, not for lights
    const states =
      this.type !== 'light' &&
      Array.isArray((this._config as EntityConfig).states)
        ? (this._config as EntityConfig).states
        : undefined;
    const thresholds =
      this.type !== 'light' &&
      Array.isArray((this._config as EntityConfig).thresholds)
        ? (this._config as EntityConfig).thresholds
        : undefined;
    const badges =
      this.type !== 'light' &&
      Array.isArray((this._config as EntityConfig).badges)
        ? (this._config as EntityConfig).badges
        : undefined;

    const thresholdsEditor =
      this.type === 'entity' || this.type === 'sensor'
        ? html`
            <room-summary-states-row-editor
              .hass=${this.hass}
              .thresholds=${thresholds}
              .entityId=${this._config.entity_id}
              .mode=${'thresholds'}
              .isSensor=${this.type === 'sensor'}
              .isMainEntity=${this.isMainEntity}
              label=${localize(this.hass, 'editor.entity.thresholds')}
              @thresholds-value-changed=${this._thresholdsValueChanged}
            ></room-summary-states-row-editor>
          `
        : nothing;

    const badgesEditor =
      this.type === 'entity' || this.type === 'sensor'
        ? html`
            <room-summary-badge-row-editor
              .hass=${this.hass}
              .badges=${badges}
              .entityId=${this._config.entity_id}
              label=${localize(this.hass, 'editor.entity.badges')}
              @badges-value-changed=${this._badgesValueChanged}
            ></room-summary-badge-row-editor>
          `
        : nothing;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(schema: LocalizedHaFormSchema) =>
          computeLabel(schema, this.hass!)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      ${this._config.entity_id && this.type !== 'light'
        ? html`
            <room-summary-states-row-editor
              .hass=${this.hass}
              .states=${states}
              .entityId=${this._config.entity_id}
              .mode=${'states'}
              .isSensor=${this.type === 'sensor'}
              .isMainEntity=${this.isMainEntity}
              label=${localize(this.hass, 'editor.entity.states')}
              @states-value-changed=${this._statesValueChanged}
            ></room-summary-states-row-editor>
            ${thresholdsEditor} ${badgesEditor}
          `
        : nothing}
    `;
  }

  /**
   * Removes empty string properties from a config object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deep config prune
  private _cleanEmptyStrings(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _badgesValueChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const badgesValue = ev.detail.value;

    // Ensure badges is always an array, never an object
    if (!Array.isArray(badgesValue)) {
      console.warn('Badges value is not an array:', badgesValue);
      return;
    }

    // Clean empty strings from each badge config
    const cleanedBadges = badgesValue.map((badge) =>
      this._cleanEmptyStrings(badge),
    );

    const newConfig = {
      ...this._config,
      // Only set badges if array has items, otherwise remove the property
      ...(cleanedBadges.length > 0 ? { badges: cleanedBadges } : {}),
    };

    // If badges array is empty, ensure we remove the property
    if (cleanedBadges.length === 0 && 'badges' in newConfig) {
      delete newConfig.badges;
    }

    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }

  static override readonly styles: CSSResult = css`
    ha-form {
      padding: 16px;
    }
  `;
}
