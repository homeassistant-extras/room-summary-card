import type { HaFormSchema } from '@hass/components/ha-form/types';

export const INTERACTIONS: HaFormSchema = {
  name: 'interactions',
  label: 'editor.interactions',
  type: 'expandable' as const,
  flatten: true,
  icon: 'mdi:gesture-tap',
  schema: [
    {
      name: 'navigate',
      label: 'editor.navigate_path',
      required: false,
      selector: { navigation: {} },
    },
  ],
};
