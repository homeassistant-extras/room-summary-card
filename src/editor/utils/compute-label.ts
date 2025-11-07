import { localize } from '@/localize/localize';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import type { TranslationKey } from '@type/locale';

/**
 * Computes the label for a form schema field
 * @param hass - The Home Assistant instance
 * @param schema - The form schema
 * @returns The formatted label with required/optional indicator
 */
export function computeLabel(
  hass: HomeAssistant,
  schema: HaFormSchema,
): string {
  return `${localize(hass, schema.label as unknown as TranslationKey)} ${
    schema.required
      ? `(${hass.localize('ui.panel.lovelace.editor.card.config.required')})`
      : `(${hass.localize('ui.panel.lovelace.editor.card.config.optional')})`
  }`;
}
