import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { localize, type LocalizedHaFormSchema } from '@localize/localize';
import memoizeOne from 'memoize-one';

/**
 * Generates the form schema for badge configuration
 */
export const getBadgeSchema = memoizeOne(
  (hass: HomeAssistant): LocalizedHaFormSchema[] => {
    return [
      {
        name: 'entity_id',
        required: false,
        label: 'editor.entity.entity_id',
        selector: { entity: {} },
      },
      {
        name: 'label',
        required: false,
        label: 'editor.badge.label',
        selector: { template: { preview: true } },
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
