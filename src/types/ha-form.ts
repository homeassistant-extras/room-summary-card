export interface HaFormBaseSchema {
  name: string;
  label: string;
}

export type HaFormSchema = HaFormSelector;

export interface HaFormSelector extends HaFormBaseSchema {
  type?: never;
  selector: Selector;
}

export type Selector = AreaSelector | SelectSelector;

export interface AreaSelector {
  area: {};
}

export interface SelectSelector {
  select: {
    multiple?: boolean;
    custom_value?: boolean;
    mode?: 'list';
    options: string[] | SelectOption[];
  };
}

export interface SelectOption {
  value: string;
  label: string;
}
