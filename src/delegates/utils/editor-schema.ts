import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';

const deviceClasses = async (
  hass: HomeAssistant,
  area: string,
): Promise<string[]> => {
  const entities = Object.values(hass.entities).filter((entity) => {
    const entityDomain = computeDomain(entity.entity_id);

    return (
      entityDomain === 'sensor' &&
      (entity.area_id === area ||
        (entity.device_id && hass.devices[entity.device_id]?.area_id === area))
    );
  });

  const numericDeviceClasses = await getSensorNumericDeviceClasses(hass);
  const classes = entities
    .map(
      (entity) => hass.states[entity.entity_id]?.attributes.device_class ?? '',
    )
    .filter(
      (c) => c && numericDeviceClasses.numeric_device_classes.includes(c),
    );

  return [...new Set(classes)];
};

export const getSchema = async (
  hass: HomeAssistant,
  area: string,
): Promise<HaFormSchema[]> => {
  const sensorClasses = await deviceClasses(hass, area);
  return [
    { name: 'area', label: 'Area', required: true, selector: { area: {} } },
    {
      name: 'content',
      label: 'Content',
      type: 'expandable',
      flatten: true,
      icon: 'mdi:text-short',
      schema: [
        {
          name: 'area_name',
          label: 'Area name',
          required: false,
          selector: { text: {} },
        },
      ],
    },
    {
      name: 'entities',
      label: 'Entities',
      type: 'expandable' as const,
      flatten: true,
      icon: 'mdi:devices',
      schema: [
        {
          name: 'entity',
          label: 'Main room entity',
          required: false,
          selector: { entity: { multiple: false } },
        },
        {
          name: 'entities',
          label: 'Area side entities',
          required: false,
          selector: { entity: { multiple: true } },
        },
        {
          name: 'sensors',
          label: 'Individual sensor entities',
          required: false,
          selector: { entity: { multiple: true } },
        },
        {
          name: 'sensor_classes',
          label: 'Sensor classes',
          selector: {
            select: {
              reorder: true,
              multiple: true,
              custom_value: true,
              options: sensorClasses,
            },
          },
        },
      ],
    },
    {
      name: 'features',
      label: 'Features',
      type: 'expandable' as const,
      flatten: true,
      icon: 'mdi:list-box',
      schema: [
        {
          name: 'features',
          label: 'Features',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: 'Hide Climate Label',
                  value: 'hide_climate_label',
                },
                { label: 'Hide Area Stats', value: 'hide_area_stats' },
                {
                  label: 'Hide Sensor icons',
                  value: 'hide_sensor_icons',
                },
                {
                  label: 'Exclude Default Entities',
                  value: 'exclude_default_entities',
                },
                {
                  label: 'Skip Climate Styles',
                  value: 'skip_climate_styles',
                },
                {
                  label: 'Skip Card Background Styles',
                  value: 'skip_entity_styles',
                },
              ],
            },
          },
        },
      ],
    },
    {
      name: 'styles',
      label: 'Styles',
      type: 'expandable',
      flatten: true,
      icon: 'mdi:brush-variant',
      schema: [
        {
          name: 'sensor_layout',
          label: 'Sensor Layout',
          required: false,
          selector: {
            select: {
              mode: 'dropdown' as const,
              options: [
                { label: 'Default (in label area)', value: 'default' },
                {
                  label: 'Bottom',
                  value: 'bottom',
                },
                {
                  label: 'Vertical Stack',
                  value: 'stacked',
                },
              ],
            },
          },
        },
      ],
    },
    {
      name: 'interactions',
      label: 'Interactions',
      type: 'expandable' as const,
      flatten: true,
      icon: 'mdi:gesture-tap',
      schema: [
        {
          name: 'navigate',
          label: 'Navigate path when card tapped',
          required: false,
          selector: { text: { type: 'url' as const } },
        },
      ],
    },
  ];
};
