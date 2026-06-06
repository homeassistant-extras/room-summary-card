// problem-entity-list is imported dynamically
import '@cards/components/problem/list/problem-entity-list';
import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import { fireEvent } from '@homeassistant-extras/hass/common/dom/fire_event';
import type { HassDialog } from '@homeassistant-extras/hass/dialogs/make-dialog-manager';
import { d } from '@util/debug';
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createCloseHeading } from './create-close-heading';
import type { ProblemDialogParams } from './show-dialog-problem';

/**
 * Problem Dialog Component
 *
 * Dialog that displays all problem entities when the problem indicator is clicked.
 * Each entity can be clicked to open its more-info dialog.
 */
@customElement('problem-dialog')
export class ProblemDialog
  extends HassUpdateMixin(LitElement)
  implements HassDialog<ProblemDialogParams>
{
  /**
   * Array of problem entity states
   */
  @property({ type: Array })
  problemEntities: string[] = [];

  /**
   * Whether the dialog is open
   */
  @state() private _opened = false;

  /**
   * Owning `room-summary-card` host. Read by the `HassUpdateMixin` so the
   * portalled dialog tree subscribes to the correct card's shadow root.
   */
  override _host?: Element;

  /**
   * Opens the dialog with the given entities
   * Supports both direct call (entities array) and dialog manager (params object)
   */
  showDialog(params: ProblemDialogParams): void {
    this.problemEntities = params.entities;
    this.config = params.config;
    // Set the owner host before re-binding so the mixin walk picks it up.
    // The dialog's own connectedCallback already ran (via HA's dialog
    // manager) before this method, so the listener was not attached yet.
    this._host = params.ownerHost;
    this._unbindHassUpdateListener();
    this._bindHassUpdateListener();
    this._opened = true;
  }

  public closeDialog() {
    this._opened = false;
    return true;
  }

  /**
   * Handles dialog close event
   */
  private _dialogClosed(): void {
    this._opened = false;
    // Fire dialog-closed event for proper lifecycle management
    fireEvent(this, 'dialog-closed', { dialog: this.localName });
  }

  /**
   * Renders the component
   */
  override render(): TemplateResult | typeof nothing {
    d(this.config, 'problem-dialog', 'render');
    if (!this.hass || this.problemEntities.length === 0) {
      return nothing;
    }

    return html`
      <ha-dialog
        ?open=${this._opened}
        .scrimClickAction=${'close'}
        .escapeKeyAction=${'close'}
        .heading=${createCloseHeading(this.hass)}
        @closed=${this._dialogClosed}
      >
        <problem-entity-list
          .entities=${this.problemEntities}
          .hass=${this.hass}
          .config=${this.config}
        ></problem-entity-list>
      </ha-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'problem-dialog': ProblemDialog;
  }
}
