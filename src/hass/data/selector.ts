/**
 * https://github.com/home-assistant/frontend/blob/dev/src/data/selector.ts
 */

export type Selector =
  | AreaSelector
  | EntitySelector
  | SelectSelector
  | StringSelector;

export interface AreaSelector {
  area: {};
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
