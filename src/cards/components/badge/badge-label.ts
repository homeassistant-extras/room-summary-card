import { LabelTemplateConnection } from '@delegates/label-template-connection';
import { isTemplateString } from '@homeassistant-extras/hass/common/string/is_template';
import { HassConfigMixin } from '@homeassistant-extras/hass/mixins/hass-config-mixin';
import type { Config } from '@type/config';
import { d } from '@util/debug';
import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Text content inside a badge. Handles static labels and live Jinja templates.
 */
@customElement('room-badge-label')
export class RoomBadgeLabel extends HassConfigMixin<typeof LitElement, Config>(
  LitElement,
) {
  private readonly _labelTemplateConn = new LabelTemplateConnection(() =>
    this.requestUpdate(),
  );

  public entityId = '';

  public label?: string;

  static override readonly styles = css`
    :host {
      display: inline-flex;
      justify-content: center;
      padding: 0 2px;
      overflow: hidden;
      font-size: 0.65rem;
      line-height: 1;
      white-space: nowrap;
    }
  `;

  override disconnectedCallback(): void {
    this._labelTemplateConn.disconnect();
    super.disconnectedCallback();
  }

  override render(): TemplateResult | typeof nothing {
    d(this.config, 'room-badge-label', 'render');
    if (!this.label) {
      this._labelTemplateConn.disconnect();
      return nothing;
    }

    if (isTemplateString(this.label)) {
      this._labelTemplateConn.sync(this.hass, this.entityId, this.label);
      return html`${this._labelTemplateConn.displayedText}`;
    }

    this._labelTemplateConn.disconnect();
    return html`${this.label}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'room-badge-label': RoomBadgeLabel;
  }
}
