import { HassConfigMixin } from '@cards/mixins/hass-config-mixin';
import { LabelTemplateConnection } from '@delegates/label-template-connection';
import { renderConfiguredEntityLabel } from '@html/render-label';
import type { EntityInformation } from '@type/room';
import { CSSResult, LitElement, css, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
const equal = require('fast-deep-equal');

/**
 * Label under a room-state icon: state/threshold label, Jinja `label`, static
 * text, attribute, or entity name.
 */
@customElement('room-entity-label')
export class RoomEntityLabel extends HassConfigMixin(LitElement) {
  private readonly _labelTemplateConn = new LabelTemplateConnection(() =>
    this.requestUpdate(),
  );

  isMainRoomEntity = false;

  get show(): boolean {
    return (
      (this.config?.features?.includes('show_entity_labels') ?? false) &&
      !(
        this.isMainRoomEntity &&
        (this.config?.background?.options?.includes('hide_icon_only') ?? false)
      )
    );
  }

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
    if (!this.show) {
      this._labelTemplateConn.disconnect();
      return nothing;
    }

    return renderConfiguredEntityLabel(
      this.hass,
      this.entity,
      this._labelTemplateConn,
      'entity-name',
    );
  }
}
