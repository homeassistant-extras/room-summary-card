import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import memoizeOne from 'memoize-one';

/**
 * Generates the form schema for badge configuration
 */
export const getBadgeSchema = memoizeOne(
  (entity_id: string, hass: HomeAssistant): HaFormSchema[] => {
    return [
      {
        name: 'entity_id',
        required: false,
        label: 'editor.entity.entity_id',
        selector: { entity: {} },
      },
      {
        name: 'position',
        required: false,
        label: 'editor.badge.position_label',
        selector: {
          select: {
            mode: 'dropdown' as const,
            options: [
              {
                value: 'top_right',
                label:
                  localize(hass, 'editor.badge.position.top_right') ||
                  'Top Right',
              },
              {
                value: 'top_left',
                label:
                  localize(hass, 'editor.badge.position.top_left') ||
                  'Top Left',
              },
              {
                value: 'bottom_right',
                label:
                  localize(hass, 'editor.badge.position.bottom_right') ||
                  'Bottom Right',
              },
              {
                value: 'bottom_left',
                label:
                  localize(hass, 'editor.badge.position.bottom_left') ||
                  'Bottom Left',
              },
            ],
          },
        },
      },
      {
        name: 'mode',
        required: false,
        label: 'editor.badge.mode_label',
        selector: {
          select: {
            mode: 'dropdown' as const,
            options: [
              {
                value: 'show_always',
                label:
                  localize(hass, 'editor.badge.mode.show_always') ||
                  'Show Always',
              },
              {
                value: 'if_match',
                label:
                  localize(hass, 'editor.badge.mode.if_match') || 'If Match',
              },
              {
                value: 'homeassistant',
                label:
                  localize(hass, 'editor.badge.mode.homeassistant') ||
                  'Home Assistant',
              },
            ],
          },
        },
      },
    ];
  },
);

/**
 * Computes the label for a form schema field
 */
export function computeLabelCallback(
  schema: HaFormSchema,
  hass: HomeAssistant,
): string {
  if (!schema.label) return '';
  return `${localize(hass, schema.label)} ${
    schema.required
      ? `(${hass.localize('ui.panel.lovelace.editor.card.config.required')})`
      : `(${hass.localize('ui.panel.lovelace.editor.card.config.optional')})`
  }`;
}
