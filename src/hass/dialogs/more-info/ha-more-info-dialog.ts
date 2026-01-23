/**
 * https://github.com/home-assistant/frontend/blob/dev/src/dialogs/more-info/ha-more-info-dialog.ts
 */

export interface MoreInfoDialogParams {
  entityId: string | null;
  data?: Record<string, any>;
}
