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

    // Clean up empty arrays
    if (!config.features?.length) {
      delete config.features;
    }
    if (!config.sensor_classes?.length) {
      delete config.sensor_classes;
    }

    // @ts-ignore
    fireEvent(this, 'config-changed', {
      config,
    });
  }
}
