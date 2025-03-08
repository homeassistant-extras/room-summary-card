/**
 * https://github.com/home-assistant/frontend/blob/dev/src/components/ha-form/types.ts
 */

import type { Selector } from '@hass/data/selector';

export type HaFormSchema = HaFormSelector;

export interface HaFormBaseSchema {
  name: string;
  required?: boolean;
  // custom field to ease some pain
  label: string;
}

export interface HaFormSelector extends HaFormBaseSchema {
  type?: never;
  selector: Selector;
}
