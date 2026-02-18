import { fireEvent } from '@hass/common/dom/fire_event';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';

export interface ProblemDialogParams {
  entities: EntityState[];
  config?: Config;
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
