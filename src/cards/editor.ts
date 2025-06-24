import { getSchema } from '@/editor/editor-schema';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { Task } from '@lit/task';
import type { Config } from '@type/config';
import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators.js';

export class RoomSummaryCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

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
    task: async ([area]) => await getSchema(this.hass, area),
    args: () => [this._config?.area],
  });

  /**
   * renders the lit element card
   * @returns The rendered HTML template
   */
  override render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return this._getEntitiesTask.render({
      initial: () => nothing,
      pending: () => nothing,
      complete: (value) => html`
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${value}
          .computeLabel=${(s: HaFormSchema) => s.label}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `,
      error: (error) => html`${error}`,
    });
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
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

    Object.keys(obj).forEach((k) => {
      !obj[k] && delete obj[k];
      this._cleanEmptyArrays(obj, k);
    });
    if (!Object.keys(obj).length) delete config[key];
  }
}
