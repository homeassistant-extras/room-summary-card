import type { HaFormSchema } from '@homeassistant-extras/hass/components/ha-form/types';
import { createLocalize } from '@homeassistant-extras/hass/localize/create-localize';
import type { TranslationKeysFrom } from '@homeassistant-extras/hass/localize/types';

import * as en from '../translations/en.json';
// Import other languages as needed above this line and in order

/** Translation keys derived from the English source JSON. */
export type TranslationKey = TranslationKeysFrom<typeof en>;

/** Editor form schema with `label` typed as a card translation key. */
export type LocalizedHaFormSchema = HaFormSchema<TranslationKey>;

export const localize = createLocalize<TranslationKey>({
  en,
  // Add more languages here in order
});
