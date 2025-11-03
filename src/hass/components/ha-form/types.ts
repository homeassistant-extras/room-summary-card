/**
 * https://github.com/home-assistant/frontend/blob/dev/src/components/ha-form/types.ts
 */

import type { Selector } from '@hass/data/selector';
import type { TranslationKey } from '@type/locale';

export type HaFormSchema =
  | HaFormGridSchema
  | HaFormExpandableSchema
  | HaFormSelector;

export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
  // custom field to ease some pain
  label: TranslationKey;
}

export interface HaFormGridSchema extends HaFormBaseSchema {
  type: 'grid';
  flatten?: boolean;
  column_min_width?: string;
  schema: readonly HaFormSchema[];
}

export interface HaFormExpandableSchema extends HaFormBaseSchema {
  type: 'expandable';
  flatten?: boolean;
  title?: string;
  icon?: string;
  iconPath?: string;
  expanded?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  schema: readonly HaFormSchema[];
}

export interface HaFormSelector extends HaFormBaseSchema {
  type?: never;
  selector: Selector;
}
