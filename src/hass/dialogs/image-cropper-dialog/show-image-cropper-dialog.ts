/**
 * https://github.com/home-assistant/frontend/blob/dev/src/dialogs/image-cropper-dialog/show-image-cropper-dialog.ts
 */

export interface CropOptions {
  round: boolean;
  type?: 'image/jpeg' | 'image/png';
  quality?: number;
  aspectRatio?: number;
}
