/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts
 */

import type { CropOptions } from '@hass/dialogs/image-cropper-dialog/show-image-cropper-dialog';

export type Selector =
  | AreaSelector
  | EntitySelector
  | ImageSelector
  | NumberSelector
  | ObjectSelector
  | SelectSelector
  | StringSelector;

export interface AreaSelector {
  area: {};
}

export interface ImageSelector {
  image: { original?: boolean; crop?: CropOptions } | null;
}

interface EntitySelectorFilter {
  domain?: string | readonly string[];
}

export interface EntitySelector {
  entity: {
    multiple?: boolean;
    filter?: EntitySelectorFilter | readonly EntitySelectorFilter[];
  } | null;
}

export interface NumberSelector {
  number: {
    min?: number;
    max?: number;
    step?: number | 'any';
    mode?: 'box' | 'slider';
    unit_of_measurement?: string;
    slider_ticks?: boolean;
  } | null;
}

export interface ObjectSelector {
  object: {} | null;
}

export interface SelectSelector {
  select: {
    multiple?: boolean;
    custom_value?: boolean;
    mode?: 'list' | 'dropdown';
    options: string[] | SelectOption[];
    reorder?: boolean;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface StringSelector {
  text: {
    multiline?: boolean;
    type?:
      | 'number'
      | 'text'
      | 'search'
      | 'tel'
      | 'url'
      | 'email'
      | 'password'
      | 'date'
      | 'month'
      | 'week'
      | 'time'
      | 'datetime-local'
      | 'color';
    suffix?: string;
  };
}
