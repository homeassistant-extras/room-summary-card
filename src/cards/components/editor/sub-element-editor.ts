import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config/entity';
import type { CSSResult, TemplateResult } from 'lit';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

export interface SubElementEditorConfig {
  index?: number;
  elementConfig?: EntityConfig | string;
  field: 'entities' | 'lights';
  type: 'entity' | 'sensor';
  isMainEntity?: boolean;
}

declare global {
  interface HASSDomEvents {
    'go-back': undefined;
  }
}

export class RoomSummarySubElementEditor extends LitElement {
  public hass!: HomeAssistant;

  @property({ attribute: false }) public config!: SubElementEditorConfig;

  @state() private _guiModeAvailable = true;

  @state() private _guiMode = true;

  protected override render(): TemplateResult {
    return html`
      <div class="header">
        <div class="back-title">
          <ha-icon-button-prev
            .label=${this.hass.localize('ui.common.back')}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span slot="title">
            ${this.hass.localize(
              `ui.panel.lovelace.editor.sub-element-editor.types.row`,
            )}
          </span>
        </div>
        <ha-icon-button
          class="gui-mode-button"
          @click=${this._toggleMode}
          .disabled=${!this._guiModeAvailable}
          .label=${this.hass.localize(
            this._guiMode
              ? 'ui.panel.lovelace.editor.edit_card.show_code_editor'
              : 'ui.panel.lovelace.editor.edit_card.show_visual_editor',
          )}
        >
          <ha-icon
            icon=${this._guiMode ? 'mdi:code-braces' : 'mdi:list-box-outline'}
          ></ha-icon>
        </ha-icon-button>
      </div>
      ${this._renderEditor()}
    `;
  }

  private _renderEditor() {
    const type = this.config.type;

    if (type === 'entity' || type === 'sensor') {
      if (this._guiMode) {
        return html`
          <room-summary-entity-detail-editor
            class="editor"
            .hass=${this.hass}
            .value=${this.config.elementConfig}
            .type=${type}
            .isMainEntity=${this.config.isMainEntity ?? false}
            @config-changed=${this._handleConfigChanged}
          ></room-summary-entity-detail-editor>
        `;
      } else {
        // YAML mode
        return html`
          <ha-yaml-editor
            .defaultValue=${this.config.elementConfig || {}}
            autofocus
            .hass=${this.hass}
            @value-changed=${this._handleYAMLChanged}
            dir="ltr"
            .showErrors=${false}
          ></ha-yaml-editor>
        `;
      }
    }

    return nothing;
  }

  private _handleConfigChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = ev.detail.config;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: value });
  }

  private _handleYAMLChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = ev.detail.value;
    // @ts-ignore
    fireEvent(this, 'config-changed', { config: value });
  }

  private _toggleMode(): void {
    this._guiMode = !this._guiMode;
  }

  private _goBack(): void {
    fireEvent(this, 'go-back', undefined);
  }

  static override styles: CSSResult = css`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--divider-color);
    }

    .back-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .editor {
      padding: 16px;
    }

    ha-icon-button-prev {
      color: var(--primary-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'room-summary-sub-element-editor': RoomSummarySubElementEditor;
  }
}
