import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import {
  CONTENT,
  FEATURES,
  INTERACTIONS,
  MAIN,
  OCCUPANCY,
} from './schema-constants';

const areaEntities = (hass: HomeAssistant, area: string) => {
  return Object.values(hass.entities)
    .filter((entity) => {
      return (
        entity.area_id === area ||
        (entity.device_id && hass.devices[entity.device_id]?.area_id === area)
      );
    })
    .map((entity) => entity.entity_id);
};

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

const schemeStyles = (entities: string[]): HaFormSchema => {
  return {
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
      {
        name: 'background',
        label: 'Background',
        type: 'expandable',
        icon: 'mdi:format-paint',
        schema: [
          { name: 'image', label: 'Background Image', selector: { image: {} } },
          {
            name: 'image_entity',
            label: 'Background Image Entity',
            selector: { entity: { filter: { domain: ['image', 'person'] } } },
          },
          {
            name: 'opacity',
            label: 'Background Opacity',
            required: false,
            selector: {
              number: {
                mode: 'slider' as const,
                unit_of_measurement: '%',
                min: 0,
                max: 100,
              },
            },
          },
          {
            name: 'options',
            label: 'Options',
            selector: {
              select: {
                multiple: true,
                mode: 'list' as const,
                options: [
                  {
                    label: 'Disable Background Image',
                    value: 'disable',
                  },
                  {
                    label: 'Icon Background',
                    value: 'icon_background',
                  },
                  {
                    label: 'Hide Icon Only',
                    value: 'hide_icon_only',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'thresholds',
        label: 'Thresholds',
        type: 'expandable',
        icon: 'mdi:thermometer-alert',
        schema: [
          {
            name: 'temperature',
            label: 'Temperature threshold',
            required: false,
            selector: {
              number: { mode: 'box' as const, unit_of_measurement: '°' },
            },
          },
          {
            name: 'humidity',
            label: 'Humidity threshold',
            required: false,
            selector: {
              number: {
                mode: 'slider' as const,
                unit_of_measurement: '%',
                min: 0,
                max: 100,
              },
            },
          },
          {
            name: 'temperature_entity',
            label: 'Temperature Entity',
            required: false,
            selector: {
              entity: {
                multiple: false,
                include_entities: entities,
                filter: {
                  device_class: 'temperature',
                },
              },
            },
          },
          {
            name: 'humidity_entity',
            label: 'Humidity Entity',
            required: false,
            selector: {
              entity: {
                multiple: false,
                include_entities: entities,
                filter: {
                  device_class: 'humidity',
                },
              },
            },
          },
        ],
      },
      {
        name: 'styles',
        label: 'Your CSS Styles',
        type: 'expandable',
        icon: 'mdi:spray',
        schema: [
          {
            name: 'card',
            label: 'Card Styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'entities',
            label: 'Entities Container Styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'entity_icon',
            label: 'Entity Icon Styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'sensors',
            label: 'Sensor Styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'stats',
            label: 'Stats Styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'title',
            label: 'Title Styles',
            required: false,
            selector: { object: {} },
          },
        ],
      },
    ],
  };
};

export const getSchema = async (
  hass: HomeAssistant,
  area: string,
): Promise<HaFormSchema[]> => {
  const sensorClasses = await deviceClasses(hass, area);
  const entities = areaEntities(hass, area);

  return [
    MAIN,
    CONTENT,
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
          selector: { entity: { multiple: false, include_entities: entities } },
        },
        {
          name: 'entities',
          label: 'Area side entities',
          required: false,
          selector: { entity: { multiple: true, include_entities: entities } },
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
    OCCUPANCY,
    FEATURES,
    schemeStyles(entities),
    INTERACTIONS,
  ];
};
