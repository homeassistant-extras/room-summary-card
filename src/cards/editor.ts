import {
  areaEntities,
  deviceClasses,
  entityFeaturesSchema,
  getAreaSchema,
  getLightsSchema,
  getMainSchemaRest,
  getOccupancySchema,
  getSensorsSchemaRest,
} from '@/editor/editor-schema';
import { localize } from '@/localize/localize';
import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import type { HASSDomEvent } from '@hass/common/dom/fire_event';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { Task } from '@lit/task';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import type { TranslationKey } from '@type/locale';
import { CSSResult, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import type { Ref } from 'lit/directives/ref.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styles } from '../theme/css/editor';

export class RoomSummaryCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Current active tab index
   */
  @state()
  private _currentTab = 0;

  /**
   * Scroll state for tab container
   */
  @state()
  private _showLeftScroll = false;

  @state()
  private _showRightScroll = false;

  /**
   * Reference to the tab bar container for scroll detection
   */
  private _tabContainerRef: Ref<HTMLDivElement> = createRef();

  /**
   * Sub-element editor configuration for editing individual entities
   */
  @state()
  private _subElementEditorConfig?: SubElementEditorConfig;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * Task that fetches the entities asynchronously
   * Uses the Home Assistant web sockets Promise
   */
  _getEntitiesTask = new Task(this, {
    task: async ([area]) => {
      if (!area) return { sensorClasses: [], entities: [] };
      const sensorClasses = await deviceClasses(this.hass, area);
      const entities = areaEntities(this.hass, area);
      return {
        sensorClasses,
        entities,
      };
    },
    args: () => [this._config?.area],
  });

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    // Show sub-element editor if active
    if (this._subElementEditorConfig) {
      return html`
        <room-summary-sub-element-editor
          .hass=${this.hass}
          .config=${this._subElementEditorConfig}
          @go-back=${this._goBack}
          @config-changed=${this._handleSubElementChanged}
        ></room-summary-sub-element-editor>
      `;
    }

    return html`
      <div class="card-config">
        <div class="tab-bar-wrapper">
          <div
            class="scroll-indicator scroll-indicator-left ${this._showLeftScroll
              ? 'visible'
              : ''}"
          >
            <svg class="scroll-arrow" viewBox="0 0 24 24">
              <path
                d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
              />
            </svg>
          </div>
          <div
            class="tab-bar-container"
            ${ref(this._tabContainerRef)}
            @scroll=${this._handleScroll}
          >
            <mwc-tab-bar
              .activeIndex=${this._currentTab}
              @MDCTabBar:activated=${this._handleTabChange}
            >
              <mwc-tab label="Main"></mwc-tab>
              <mwc-tab label="Entities"></mwc-tab>
              <mwc-tab label="Lights"></mwc-tab>
              <mwc-tab label="Sensors"></mwc-tab>
              <mwc-tab label="Occupancy"></mwc-tab>
            </mwc-tab-bar>
          </div>
          <div
            class="scroll-indicator scroll-indicator-right ${this
              ._showRightScroll
              ? 'visible'
              : ''}"
          >
            <svg class="scroll-arrow" viewBox="0 0 24 24">
              <path
                d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
              />
            </svg>
          </div>
        </div>
        ${this._renderTabContent()}
      </div>
    `;
  }

  private _handleTabChange(ev: CustomEvent): void {
    this._currentTab = ev.detail.index;
  }

  private _handleScroll(): void {
    this._updateScrollIndicators();
  }

  private _updateScrollIndicators(): void {
    const container = this._tabContainerRef.value;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    // Show left indicator if scrolled right
    this._showLeftScroll = scrollLeft > 5;

    // Show right indicator if there's more content to the right
    this._showRightScroll = scrollLeft < scrollWidth - clientWidth - 5;
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>,
  ): void {
    super.updated(changedProperties);

    // Update scroll indicators after render
    if (
      changedProperties.has('_config') ||
      changedProperties.has('_currentTab')
    ) {
      setTimeout(() => this._updateScrollIndicators(), 100);
    }
  }

  /**
   * Computes the label for a form schema field
   * @param {HaFormSchema} schema - The form schema
   * @returns The formatted label with required/optional indicator
   */
  private _computeLabel(schema: HaFormSchema): string {
    return `${localize(this.hass, schema.label as unknown as TranslationKey)} ${
      schema.required
        ? `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.required')})`
        : `(${this.hass!.localize('ui.panel.lovelace.editor.card.config.optional')})`
    }`;
  }

  private _renderTabContent() {
    // Main tab (tab 0) uses split layout: area form, entity row editor, area_name + rest form
    if (this._currentTab === 0) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          const areaSchema = getAreaSchema();
          const restSchema = getMainSchemaRest(
            this.hass,
            value.entities as string[],
          );

          // Convert single entity to array for row-editor
          const entityArray = this._config.entity ? [this._config.entity] : [];

          return html`
            <div class="entities-tab">
              <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${[areaSchema]}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._valueChanged}
              ></ha-form>
              <room-summary-entities-row-editor
                .hass=${this.hass}
                .entities=${entityArray}
                .availableEntities=${value.entities as string[]}
                field="entities"
                .single=${true}
                label=${this.hass.localize('editor.area.room_entity') ||
                'Room Entity'}
                @value-changed=${this._entityRowChanged}
                @edit-detail-element=${this._editDetailElement}
              ></room-summary-entities-row-editor>
              <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${restSchema}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          `;
        },
        error: (error) => html`${error}`,
      });
    }
    // Entities tab uses custom row editor
    if (this._currentTab === 1) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          return html`
            <div class="entities-tab">
              <div class="info-header">
                ${localize(this.hass, 'editor.entities.entities_info')}
              </div>
              <room-summary-entities-row-editor
                .hass=${this.hass}
                .entities=${this._config.entities}
                .availableEntities=${value.entities as string[]}
                field="entities"
                label=${this.hass.localize(
                  'ui.panel.lovelace.editor.card.generic.entities',
                ) || 'Entities'}
                @value-changed=${this._entitiesRowChanged}
                @edit-detail-element=${this._editDetailElement}
              ></room-summary-entities-row-editor>
              <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${[entityFeaturesSchema(this.hass)]}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          `;
        },
        error: (error) => html`${error}`,
      });
    }

    // Sensors tab (tab 3) uses custom row editor
    if (this._currentTab === 3) {
      return this._getEntitiesTask.render({
        initial: () => nothing,
        pending: () => nothing,
        complete: (value) => {
          const restSchema = getSensorsSchemaRest(
            this.hass,
            value.sensorClasses as string[],
          );

          return html`
            <div class="entities-tab">
              <div class="info-header">
                ${localize(this.hass, 'editor.sensor.sensors_info')}
              </div>
              <room-summary-entities-row-editor
                .hass=${this.hass}
                .entities=${this._config.sensors}
                .availableEntities=${value.entities as string[]}
                field="entities"
                label=${this.hass.localize(
                  'editor.sensor.individual_sensor_entities',
                ) || 'Individual sensor entities'}
                @value-changed=${this._sensorsRowChanged}
                @edit-detail-element=${this._editDetailElement}
              ></room-summary-entities-row-editor>
              <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${restSchema}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._valueChanged}
              ></ha-form>
            </div>
          `;
        },
        error: (error) => html`${error}`,
      });
    }

    // Other tabs use ha-form
    return this._getEntitiesTask.render({
      initial: () => nothing,
      pending: () => nothing,
      complete: (value) => {
        let schema: HaFormSchema[] = [];
        let infoText: TranslationKey | undefined;
        if (this._currentTab === 2) {
          schema = getLightsSchema(this.hass, value.entities as string[]);
          infoText = 'editor.background.multi_light_background_info';
        } else if (this._currentTab === 4) {
          schema = getOccupancySchema(this.hass, value.entities as string[]);
          infoText = 'editor.occupancy.occupancy_info';
        }

        return html`
          ${infoText
            ? html`
                <div class="info-header">${localize(this.hass, infoText)}</div>
              `
            : nothing}
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${schema}
            .computeLabel=${this._computeLabel.bind(this)}
            @value-changed=${this._valueChanged}
          ></ha-form>
        `;
      },
      error: (error) => html`${error}`,
    });
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = {
      ...config,
      occupancy: {
        ...config.occupancy,
        entities: config.occupancy?.entities ?? [],
      },
    };
  }

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;

    if (!config) return;

    // Clean default values
    if (config.sensor_layout === 'default') delete config.sensor_layout;

    // Clean up undefined entity field
    if (config.entity === undefined) delete config.entity;

    // Clean up empty arrays
    this._cleanEmptyArrays(config, 'features');
    this._cleanEmptyArrays(config, 'entities');
    this._cleanEmptyArrays(config, 'lights');
    this._cleanEmptyArrays(config, 'problem_entities');
    this._cleanEmptyArrays(config, 'sensor_classes');

    // Clean nested objects
    this._cleanEmptyProps(config, 'background');
    this._cleanEmptyProps(config, 'thresholds');
    this._cleanEmptyProps(config, 'occupancy');

    // @ts-ignore
    fireEvent(this, 'config-changed', { config });
  }

  private _entitiesRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;
    const field = (ev.target as any).field as 'entities' | 'lights';

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    this._config = { ...this._config!, [field]: value };

    // Create a new event with the updated config for _valueChanged
    const configEvent = new CustomEvent('value-changed', {
      detail: { value: this._config },
    });
    this._valueChanged(configEvent);
  }

  private _sensorsRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    this._config = { ...this._config!, sensors: value };

    // Create a new event with the updated config for _valueChanged
    const configEvent = new CustomEvent('value-changed', {
      detail: { value: this._config },
    });
    this._valueChanged(configEvent);
  }

  private _entityRowChanged(ev: CustomEvent) {
    const value = ev.detail.value;

    // Guard: only process if value is an array (from our custom component)
    // If it's a string, it's from the picker directly and should be ignored
    if (!Array.isArray(value)) {
      return;
    }

    // Convert array back to single entity (take first element or undefined)
    const entityValue = value.length > 0 ? value[0] : undefined;

    this._config = { ...this._config!, entity: entityValue };

    // Create a new event with the updated config for _valueChanged
    const configEvent = new CustomEvent('value-changed', {
      detail: { value: this._config },
    });
    this._valueChanged(configEvent);
  }

  private _editDetailElement(
    ev: HASSDomEvent<{
      subElementConfig: SubElementEditorConfig;
    }>,
  ): void {
    const config = { ...ev.detail.subElementConfig };

    // Set type to 'sensor' if we're on the sensors tab (tab 3)
    if (this._currentTab === 3 && config.field === 'entities') {
      config.type = 'sensor';
    }

    this._subElementEditorConfig = config;
  }

  private _handleSubElementChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config || !this.hass || !this._subElementEditorConfig) {
      return;
    }

    const value = ev.detail.config;
    const { field, index, type } = this._subElementEditorConfig;

    // Handle single entity field (from tab 0)
    if (field === 'entities' && this._currentTab === 0) {
      if (!value) {
        this._config = { ...this._config, entity: undefined };
        this._goBack();
      } else {
        // If value is a string, keep as string, otherwise use EntityConfig
        this._config = {
          ...this._config,
          entity: typeof value === 'string' ? value : (value as EntityConfig),
        };
      }
    } else if (field === 'entities' && this._currentTab === 1) {
      // Handle entities array (from tab 1)
      const newConfigEntities = (this._config.entities || []).concat();
      if (!value) {
        newConfigEntities.splice(index!, 1);
        this._goBack();
      } else {
        // If value is a string, convert to EntityConfig
        if (typeof value === 'string') {
          newConfigEntities[index!] = value;
        } else {
          newConfigEntities[index!] = value as EntityConfig;
        }
      }
      this._config = { ...this._config, entities: newConfigEntities };
    } else if (field === 'entities' && this._currentTab === 3) {
      // Handle sensors array (from tab 3)
      const newConfigSensors = (this._config.sensors || []).concat();
      if (!value) {
        newConfigSensors.splice(index!, 1);
        this._goBack();
      } else {
        // If value is a string, keep as string, otherwise use SensorConfig
        if (typeof value === 'string') {
          newConfigSensors[index!] = value;
        } else {
          newConfigSensors[index!] = value as EntityConfig;
        }
      }
      this._config = { ...this._config, sensors: newConfigSensors };
    } else if (field === 'lights') {
      const newConfigLights = (this._config.lights || []).concat();
      if (!value) {
        newConfigLights.splice(index!, 1);
        this._goBack();
      } else {
        // Lights are always strings
        const entityId =
          typeof value === 'string' ? value : (value as EntityConfig).entity_id;
        newConfigLights[index!] = entityId;
      }
      this._config = { ...this._config, lights: newConfigLights };
    }

    this._subElementEditorConfig = {
      ...this._subElementEditorConfig,
      elementConfig: value,
    };

    ev.detail.value = this._config;
    this._valueChanged(ev);
  }

  private _goBack(): void {
    this._subElementEditorConfig = undefined;
  }

  private _cleanEmptyArrays<T extends Record<string, any>>(
    config: T,
    key: keyof T,
  ): void {
    const arr = config[key];
    if (Array.isArray(arr) && !arr.length) delete config[key];
  }

  private _cleanEmptyProps<T extends Record<string, any>>(
    config: T,
    key: keyof T,
  ): void {
    const obj = config[key];
    if (!obj || typeof obj !== 'object') return;

    for (const k of Object.keys(obj)) {
      !obj[k] && delete obj[k];
      this._cleanEmptyArrays(obj, k);
    }
    if (!Object.keys(obj).length) delete config[key];
  }
}
