import { LabelTemplateConnection } from '@delegates/label-template-connection';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import { renderConfiguredEntityLabel } from '@html/render-label';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { d } from '@util/debug';
import equal from 'fast-deep-equal';
import {
  css,
  type CSSResult,
  LitElement,
  type nothing,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Label under a room-state icon: state/threshold label, Jinja `label`, static
 * text, attribute, or entity name.
 */
@customElement('room-entity-label')
export class RoomEntityLabel extends HassConfigMixin<typeof LitElement, Config>(
  LitElement,
) {
  private readonly _labelTemplateConn = new LabelTemplateConnection(() =>
    this.requestUpdate(),
  );

  @property({
    type: Object,
    hasChanged: (a: EntityInformation, b: EntityInformation) => !equal(a, b),
  })
  entity!: EntityInformation;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return css`
      :host {
        position: absolute;
        font-size: 0.7em;
        text-align: center;
        overflow: hidden;
        margin-top: 75%;
        display: var(--user-entity-label-display, block);
      }
    `;
  }

  override disconnectedCallback(): void {
    this._labelTemplateConn.disconnect();
    super.disconnectedCallback();
  }

  /**
   * renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    d(this.config, 'room-entity-label', 'render');
    return renderConfiguredEntityLabel(
      this.hass,
      this.entity,
      this._labelTemplateConn,
      'entity-name',
    );
  }
}
