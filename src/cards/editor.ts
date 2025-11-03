import {
  areaEntities,
  deviceClasses,
  getEntitiesSchema,
  getMainSchema,
  getOccupancySchema,
  getSensorsSchema,
} from '@/editor/editor-schema';
import { localize } from '@/localize/localize';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { Task } from '@lit/task';
import type { Config } from '@type/config';
import type { TranslationKey } from '@type/locale';
import { css, CSSResult, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';

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
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
      }

      mwc-tab-bar {
        border-bottom: 1px solid var(--divider-color);
      }

      ha-form {
        padding: 16px 0;
      }
    `;
  }

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <div class="card-config">
        <mwc-tab-bar
          .activeIndex=${this._currentTab}
          @MDCTabBar:activated=${this._handleTabChange}
        >
          <mwc-tab label="Main"></mwc-tab>
          <mwc-tab label="Entities"></mwc-tab>
          <mwc-tab label="Sensors"></mwc-tab>
          <mwc-tab label="Occupancy"></mwc-tab>
        </mwc-tab-bar>
        ${this._renderTabContent()}
      </div>
    `;
  }

  private _handleTabChange(ev: CustomEvent): void {
    this._currentTab = ev.detail.index;
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
    // Entities and Sensors tabs show the full form for now
    return this._getEntitiesTask.render({
      initial: () => nothing,
      pending: () => nothing,
      complete: (value) => {
        let schema: HaFormSchema[] = [];
        if (this._currentTab === 0) {
          schema = getMainSchema(this.hass, value.entities as string[]);
        } else if (this._currentTab === 1) {
          schema = getEntitiesSchema(this.hass, value.entities as string[]);
        } else if (this._currentTab === 2) {
          schema = getSensorsSchema(
            this.hass,
            value.sensorClasses as string[],
            value.entities as string[],
          );
        } else if (this._currentTab === 3) {
          schema = getOccupancySchema(this.hass, value.entities as string[]);
        }

        return html`
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

    // Clean default values
    if (config.sensor_layout === 'default') delete config.sensor_layout;

    // Clean up empty arrays
    this._cleanEmptyArrays(config, 'features');
    this._cleanEmptyArrays(config, 'entities');
    this._cleanEmptyArrays(config, 'problem_entities');
    this._cleanEmptyArrays(config, 'sensor_classes');

    // Clean nested objects
    this._cleanEmptyProps(config, 'background');
    this._cleanEmptyProps(config, 'thresholds');
    this._cleanEmptyProps(config, 'occupancy');

    // @ts-ignore
    fireEvent(this, 'config-changed', { config });
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
