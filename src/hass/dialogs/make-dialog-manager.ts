/**
 * https://github.com/home-assistant/frontend/blob/dev/src/dialogs/make-dialog-manager.ts
 */

import type {
  HASSDomEvent,
  ValidHassDomEvent,
} from '@hass/common/dom/fire_event';

declare global {
  // for fire event
  interface HASSDomEvents {
    'show-dialog': ShowDialogParams<unknown>;
    'close-dialog': undefined;
    'dialog-closed': DialogClosedParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    'show-dialog': HASSDomEvent<ShowDialogParams<unknown>>;
    'dialog-closed': HASSDomEvent<DialogClosedParams>;
  }
}

export interface HassDialog<
  T = HASSDomEvents[ValidHassDomEvent],
> extends HTMLElement {
  showDialog(params: T): void;
  closeDialog?: (historyState?: any) => boolean;
}

interface ShowDialogParams<T> {
  dialogTag: keyof HTMLElementTagNameMap;
  dialogImport: () => Promise<unknown>;
  dialogParams: T;
  addHistory?: boolean;
}

export interface DialogClosedParams {
  dialog: string;
}
