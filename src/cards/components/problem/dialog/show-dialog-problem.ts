import { fireEvent } from '@hass/common/dom/fire_event';
import type { Config } from '@type/config';

export interface ProblemDialogParams {
  entities: string[];
  config: Config;
  /**
   * The owning `room-summary-card` host element. Used by `HassUpdateMixin`
   * inside the portalled dialog tree to scope `hass-update` listeners back
   * to the card that opened the dialog. Optional: when omitted, the dialog
   * tree will not receive `hass-update` events.
   */
  ownerHost?: HTMLElement;
}

export const loadProblemDialog = () =>
  // this creates a new bundle in the dist folder
  // @ts-ignore - Dynamic import is supported at runtime
  import('./problem-dialog');

export const showProblemDialog = (
  element: HTMLElement,
  params: ProblemDialogParams,
) => {
  if (!params?.entities || params.entities.length === 0) {
    return;
  }

  fireEvent(element, 'show-dialog', {
    dialogTag: 'problem-dialog',
    dialogImport: loadProblemDialog,
    dialogParams: params,
  });
};
