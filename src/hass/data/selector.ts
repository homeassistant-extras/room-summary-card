/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts
 */

import type { UiAction } from '@hass/panels/lovelace/editor/hui-element-editor';

export type Selector =
  | AreaSelector
  | AttributeSelector
  | BooleanSelector
  | EntitySelector
  | IconSelector
  | MediaSelector
  | NavigationSelector
  | NumberSelector
  | ObjectSelector
  | SelectSelector
  | StringSelector
  | UiActionSelector
  | UiColorSelector;

export interface AreaSelector {
  area: {};
}

export interface AttributeSelector {
  attribute: {
    entity_id?: string | string[];
    hide_attributes?: readonly string[];
  } | null;
}

export interface BooleanSelector {
  boolean: {} | null;
}

interface EntitySelectorFilter {
  integration?: string;
  domain?: string | readonly string[];
  device_class?: string | readonly string[];
  supported_features?: number | [number];
}

export interface EntitySelector {
  entity: {
    multiple?: boolean;
    include_entities?: string[];
    exclude_entities?: string[];
    filter?: EntitySelectorFilter | readonly EntitySelectorFilter[];
  } | null;
}

export interface IconSelector {
  icon: {
    placeholder?: string;
    fallbackPath?: string;
  } | null;
}

export interface MediaSelector {
  media: {
    accept?: string[];
    image_upload?: boolean;
    clearable?: boolean;
    hide_content_type?: boolean;
    content_id_helper?: string;
  } | null;
}

export interface NavigationSelector {
  navigation: {} | null;
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

export interface UiActionSelector {
  ui_action: {
    actions?: UiAction[];
    default_action?: UiAction;
  } | null;
}

export interface UiColorSelector {
  ui_color: {
    default_color?: string;
    include_none?: boolean;
    include_state?: boolean;
  } | null;
}
