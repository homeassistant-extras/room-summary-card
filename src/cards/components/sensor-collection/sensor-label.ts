import { HassConfigMixin } from '@cards/mixins/hass-config-mixin';
import { hasFeature } from '@config/feature';
import { LabelTemplateConnection } from '@delegates/label-template-connection';
import { sensorDataToDisplaySensors } from '@delegates/utils/sensor-utils';
import { renderConfiguredEntityLabel } from '@html/render-label';
import type { EntityInformation } from '@type/room';
import type { AveragedSensor } from '@type/sensor';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
const equal = require('fast-deep-equal');

/**
 * Label beside a sensor icon: threshold/state label, Jinja `label`, static
 * text, or formatted state/attribute.
 */
@customElement('room-sensor-label')
export class RoomSensorLabel extends HassConfigMixin(LitElement) {
  private readonly _labelTemplateConn = new LabelTemplateConnection(() =>
    this.requestUpdate(),
  );

  get show(): boolean {
    return !hasFeature(this.config, 'hide_sensor_labels');
  }

  /*
   * Entity information
   */
  @property({
    type: Object,
    hasChanged: (a: EntityInformation, b: EntityInformation) => !equal(a, b),
  })
  entity: EntityInformation | undefined;

  /*
   * Entity information
   */
  @property({
    type: Object,
    hasChanged: (a: EntityInformation, b: EntityInformation) => !equal(a, b),
  })
  sensor: AveragedSensor | undefined;

  override disconnectedCallback(): void {
    this._labelTemplateConn.disconnect();
    super.disconnectedCallback();
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.show) {
      this._labelTemplateConn.disconnect();
      return nothing;
    }

    if (this.sensor) {
      return html`${sensorDataToDisplaySensors(this.sensor)}`;
    }

    if (!this.entity) {
      return nothing;
    }

    return renderConfiguredEntityLabel(
      this.hass,
      this.entity,
      this._labelTemplateConn,
      'state-display',
    );
  }
}
