import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { UiAction } from '@hass/panels/lovelace/editor/hui-element-editor';

export const INTERACTIONS: HaFormSchema = {
  name: 'actions',
  label: 'editor.interactions.interactions',
  type: 'expandable' as const,
  icon: 'mdi:gesture-tap',
  schema: [
    {
      name: 'tap_action',
      label: 'editor.interactions.tap_action',
      required: false,
      selector: {
        ui_action: {
          default_action: 'navigate' as UiAction,
        },
      },
    },
    {
      name: 'double_tap_action',
      label: 'editor.interactions.double_tap_action',
      required: false,
      selector: {
        ui_action: {
          default_action: 'more-info' as UiAction,
        },
      },
    },
    {
      name: 'hold_action',
      label: 'editor.interactions.hold_action',
      required: false,
      selector: {
        ui_action: {
          default_action: 'none' as UiAction,
        },
      },
    },
  ],
};
