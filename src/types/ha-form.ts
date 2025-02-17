/**
 * Base schema interface for Home Assistant form elements
 * Contains the common properties required for all form elements
 */
export interface HaFormBaseSchema {
  /** Unique identifier for the form element */
  name: string;
  /** Display text shown to the user for this form element */
  label: string;
}

/**
 * Primary form schema type for Home Assistant forms
 * In this simplified version, only selector-based form elements are supported
 */
export type HaFormSchema = HaFormSelector;

/**
 * Interface for selector-based form elements
 * These are input fields using various selector types
 */
export interface HaFormSelector extends HaFormBaseSchema {
  /** Type is not used for selectors as they're identified by their selector property */
  type?: never;
  /** Indicates if this field must have a value */
  required?: boolean;
  /** The specific selector type that defines the input behavior */
  selector: Selector;
}

/**
 * Union type for supported selector types
 * This simplified version only supports area and select selectors
 */
export type Selector =
  | AreaSelector
  | EntitySelector
  | SelectSelector
  | StringSelector;

/**
 * Selector for choosing an area from the Home Assistant areas registry
 */
export interface AreaSelector {
  /** Empty object as this selector currently takes no additional configuration */
  area: {};
}

/**
 * Selector for choosing an entity from the Home Assistant entities registry
 */
interface EntitySelectorFilter {
  /** Filter by a specific domain */
  domain?: string | readonly string[];
}

/**
 * Selector for choosing an entity from the Home Assistant entities registry
 * Can be filtered by domain or entity ID
 */
export interface EntitySelector {
  entity: {
    /** When true, allows selecting multiple entities */
    multiple?: boolean;
    /** A filter for certain entities */
    filter?: EntitySelectorFilter | readonly EntitySelectorFilter[];
  } | null;
}

/**
 * Selector for dropdown or multi-select inputs
 */
export interface SelectSelector {
  select: {
    /** When true, allows selecting multiple options */
    multiple?: boolean;
    /** When true, allows entering custom values not in the options list */
    custom_value?: boolean;
    /** Defines the display mode for the options */
    mode?: 'list' | 'dropdown';
    /** Available options, either as simple strings or as value-label pairs */
    options: string[] | SelectOption[];
  };
}

/**
 * Interface for defining select options with separate values and display labels
 */
export interface SelectOption {
  /** The data value to be stored when this option is selected */
  value: string;
  /** The human-readable text shown for this option in the UI */
  label: string;
}

/**
 * Selector for text-based inputs with various formats
 */
export interface StringSelector {
  text: {
    /** When true, allows entering multiple lines of text */
    multiline?: boolean;
    /** Specifies the HTML input type, affecting validation and keyboard on mobile devices */
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
    /** Text to display after the input field (e.g., units like "°C" or "%") */
    suffix?: string;
  };
}
