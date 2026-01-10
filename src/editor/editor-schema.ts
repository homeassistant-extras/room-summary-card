import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { TranslationKey } from '@type/locale';
import { INTERACTIONS } from './schema-constants';

export const areaEntities = (hass: HomeAssistant, area: string) => {
  return Object.values(hass.entities)
    .filter((entity) => {
      return (
        entity.area_id === area ||
        (entity.device_id && hass.devices[entity.device_id]?.area_id === area)
      );
    })
    .map((entity) => entity.entity_id);
};

export const deviceClasses = async (
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

const schemeStyles = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema => {
  return {
    name: 'styles',
    label: 'editor.styles.styles',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:brush-variant',
    schema: [
      {
        name: 'background',
        label: 'editor.background.background',
        type: 'expandable',
        icon: 'mdi:format-paint',
        schema: [
          {
            name: 'image',
            label: 'editor.background.background_image',
            selector: { media: { image_upload: true } },
          },
          {
            name: 'image_entity',
            label: 'editor.background.background_image_entity',
            selector: { entity: { filter: { domain: ['image', 'person'] } } },
          },
          {
            name: 'opacity',
            label: 'editor.background.background_opacity',
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
            label: 'editor.features.options',
            selector: {
              select: {
                multiple: true,
                mode: 'list' as const,
                options: [
                  {
                    label: localize(
                      hass,
                      'editor.background.disable_background_image',
                    ),
                    value: 'disable',
                  },
                  {
                    label: localize(hass, 'editor.icon.icon_background'),
                    value: 'icon_background',
                  },
                  {
                    label: localize(hass, 'editor.icon.hide_icon_only'),
                    value: 'hide_icon_only',
                  },
                ],
              },
            },
          },
        ],
      },
      {
        name: 'styles',
        label: 'editor.styles.css_styles',
        type: 'expandable',
        icon: 'mdi:spray',
        schema: [
          {
            name: 'card',
            label: 'editor.styles.card_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'stats',
            label: 'editor.styles.stats_styles',
            required: false,
            selector: { object: {} },
          },
          {
            name: 'title',
            label: 'editor.styles.title_styles',
            required: false,
            selector: { object: {} },
          },
        ],
      },

      {
        name: 'icon_opacity_preset',
        label: 'editor.styles.icon_opacity_preset',
        required: false,
        selector: {
          select: {
            mode: 'dropdown' as const,
            options: [
              {
                label: localize(hass, 'editor.styles.icon_opacity_default'),
                value: 'default',
              },
              {
                label: localize(hass, 'editor.styles.icon_opacity_medium'),
                value: 'medium',
              },
              {
                label: localize(
                  hass,
                  'editor.styles.icon_opacity_high_visibility',
                ),
                value: 'high_visibility',
              },
            ],
          },
        },
      },
    ],
  };
};

/**
 * Returns schema for entity styles only (for entities tab)
 */
export const getEntitiesStylesSchema = (
  hass: HomeAssistant,
): HaFormSchema[] => {
  return [
    {
      name: 'styles',
      label: 'editor.styles.css_styles',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'entities',
          label: 'editor.styles.entities_container_styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'entity_icon',
          label: 'editor.styles.entity_icon_styles',
          required: false,
          selector: { object: {} },
        },
        {
          name: 'room_entity_icon',
          label: 'editor.styles.room_entity_icon_styles',
          required: false,
          selector: { object: {} },
        },
      ],
    },
    {
      name: 'slider_style',
      label: 'editor.slider.slider_style',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.slider.minimalist'),
              value: 'minimalist',
            },
            {
              label: localize(hass, 'editor.slider.track'),
              value: 'track',
            },
            {
              label: localize(hass, 'editor.slider.line'),
              value: 'line',
            },
            {
              label: localize(hass, 'editor.slider.filled'),
              value: 'filled',
            },
            {
              label: localize(hass, 'editor.slider.gradient'),
              value: 'gradient',
            },
            {
              label: localize(hass, 'editor.slider.dual_rail'),
              value: 'dual-rail',
            },
            {
              label: localize(hass, 'editor.slider.dots'),
              value: 'dots',
            },
            {
              label: localize(hass, 'editor.slider.notched'),
              value: 'notched',
            },
            {
              label: localize(hass, 'editor.slider.grid'),
              value: 'grid',
            },
            {
              label: localize(hass, 'editor.slider.glow'),
              value: 'glow',
            },
            {
              label: localize(hass, 'editor.slider.shadow_trail'),
              value: 'shadow-trail',
            },
            {
              label: localize(hass, 'editor.slider.outlined'),
              value: 'outlined',
            },
          ],
        },
      },
    },
  ];
};

export const getLightsSchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'lights',
      label: 'editor.background.light_entities',
      required: false,
      selector: {
        entity: {
          multiple: true,
          include_entities: entities,
          filter: { domain: ['light', 'switch'] },
        },
      },
    },
    lightsFeaturesSchema(hass),
  ];
};

export const getSensorsSchema = (
  hass: HomeAssistant,
  sensorClasses: string[],
  entities: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'sensors',
      label: 'editor.sensor.individual_sensor_entities',
      required: false,
      selector: { entity: { multiple: true, include_entities: entities } },
    },
    {
      name: 'sensor_classes',
      label: 'editor.sensor.sensor_classes',
      selector: {
        select: {
          reorder: true,
          multiple: true,
          custom_value: true,
          options: sensorClasses,
        },
      },
    },
    {
      name: 'sensor_layout',
      label: 'editor.layout.sensor_layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.layout.default_in_label_area'),
              value: 'default',
            },
            {
              label: localize(hass, 'editor.layout.bottom'),
              value: 'bottom',
            },
            {
              label: localize(hass, 'editor.layout.vertical_stack'),
              value: 'stacked',
            },
          ],
        },
      },
    },
  ];
};

/**
 * Returns schema for sensors tab excluding the sensors field
 * Used when sensors are handled by room-summary-entities-row-editor
 */
export const getSensorsSchemaRest = (
  hass: HomeAssistant,
  sensorClasses: string[],
): HaFormSchema[] => {
  return [
    {
      name: 'sensor_classes',
      label: 'editor.sensor.sensor_classes',
      selector: {
        select: {
          reorder: true,
          multiple: true,
          custom_value: true,
          options: sensorClasses,
        },
      },
    },
    {
      name: 'sensor_layout',
      label: 'editor.layout.sensor_layout',
      required: false,
      selector: {
        select: {
          mode: 'dropdown' as const,
          options: [
            {
              label: localize(hass, 'editor.layout.default_in_label_area'),
              value: 'default',
            },
            {
              label: localize(hass, 'editor.layout.bottom'),
              value: 'bottom',
            },
            {
              label: localize(hass, 'editor.layout.vertical_stack'),
              value: 'stacked',
            },
          ],
        },
      },
    },
    {
      name: 'styles',
      label: 'editor.styles.css_styles',
      type: 'grid' as const,
      column_min_width: '100%',
      schema: [
        {
          name: 'sensors',
          label: 'editor.styles.sensor_styles',
          required: false,
          selector: { object: {} },
        },
      ],
    },
  ];
};

/**
 * Returns schema for the area field only
 */
export const getAreaSchema = (): HaFormSchema => ({
  name: 'area',
  label: 'editor.area.area',
  required: true,
  selector: { area: {} },
});

/**
 * Returns the main schema excluding area and entity fields
 * Used for tab 0 when area and entity are handled separately
 * Includes area_name and the rest of the schema
 */
export const getMainSchemaRest = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => [
  {
    name: 'content',
    label: 'editor.layout.content',
    type: 'expandable',
    flatten: true,
    icon: 'mdi:text-short',
    schema: [
      {
        name: 'area_name',
        label: 'editor.area.area_name',
        required: false,
        selector: { text: {} },
      },
    ],
  },
  {
    name: 'problem',
    label: 'editor.problem.problem',
    type: 'expandable',
    icon: 'mdi:alert-circle',
    schema: [
      {
        name: 'display',
        label: 'editor.problem.problem_display',
        required: false,
        selector: {
          select: {
            mode: 'dropdown' as const,
            options: [
              {
                label: localize(hass, 'editor.problem.problem_display_always'),
                value: 'always',
              },
              {
                label: localize(
                  hass,
                  'editor.problem.problem_display_active_only',
                ),
                value: 'active_only',
              },
              {
                label: localize(hass, 'editor.problem.problem_display_never'),
                value: 'never',
              },
            ],
          },
        },
      },
    ],
  },
  INTERACTIONS,
  schemeStyles(hass, entities),
  featuresSchema(hass),
];

/**
 * Returns schema for a single alarm configuration (occupancy, smoke, gas_leak, or water_leak)
 */
const getAlarmConfigSchema = (
  hass: HomeAssistant,
  entities: string[],
  alarmType: 'occupancy' | 'smoke' | 'gas' | 'water',
): HaFormSchema => {
  const isSmoke = alarmType === 'smoke';
  const isGas = alarmType === 'gas';
  const isWater = alarmType === 'water';

  let label: TranslationKey;
  let icon: string;
  let entitiesLabel: TranslationKey;
  let deviceClass: string[];

  if (isSmoke) {
    label = 'editor.alarm.smoke_detection';
    icon = 'mdi:smoke-detector';
    entitiesLabel = 'editor.alarm.smoke_detectors';
    deviceClass = ['smoke'];
  } else if (isGas) {
    label = 'editor.alarm.gas_detection';
    icon = 'mdi:gas-cylinder';
    entitiesLabel = 'editor.alarm.gas_sensors';
    deviceClass = ['gas'];
  } else if (isWater) {
    label = 'editor.alarm.water_detection';
    icon = 'mdi:water-alert';
    entitiesLabel = 'editor.alarm.water_sensors';
    deviceClass = ['moisture'];
  } else {
    label = 'editor.alarm.occupancy_detection';
    icon = 'mdi:motion-sensor';
    entitiesLabel = 'editor.alarm.motion_occupancy_presence_sensors';
    deviceClass = ['motion', 'occupancy', 'presence'];
  }

  let cardBorderColorLabel: TranslationKey;
  let iconColorLabel: TranslationKey;

  if (isSmoke) {
    cardBorderColorLabel = 'editor.card.card_border_color_smoke';
    iconColorLabel = 'editor.icon.icon_background_color_smoke';
  } else if (isGas) {
    cardBorderColorLabel = 'editor.card.card_border_color_gas';
    iconColorLabel = 'editor.icon.icon_background_color_gas';
  } else if (isWater) {
    cardBorderColorLabel = 'editor.card.card_border_color_water';
    iconColorLabel = 'editor.icon.icon_background_color_water';
  } else {
    cardBorderColorLabel = 'editor.card.card_border_color_occupied';
    iconColorLabel = 'editor.icon.icon_background_color_occupied';
  }

  return {
    name: alarmType,
    label,
    type: 'expandable' as const,
    icon,
    schema: [
      {
        name: 'entities',
        label: entitiesLabel,
        required: true,
        selector: {
          entity: {
            multiple: true,
            include_entities: entities,
            filter: {
              domain: ['binary_sensor'],
              device_class: deviceClass,
            },
          },
        },
      },
      {
        name: 'card_border_color',
        label: cardBorderColorLabel,
        required: false,
        selector: { ui_color: {} },
      },
      {
        name: 'icon_color',
        label: iconColorLabel,
        required: false,
        selector: { ui_color: {} },
      },
      {
        name: 'options',
        label: 'editor.alarm.alarm_options',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: localize(hass, 'editor.card.disable_card_border'),
                value: 'disabled_card_styles',
              },
              {
                label: localize(
                  hass,
                  'editor.card.disable_card_border_animations',
                ),
                value: 'disabled_card_styles_animation',
              },
              {
                label: localize(hass, 'editor.icon.disable_icon_color'),
                value: 'disable_icon_styles',
              },
              {
                label: localize(hass, 'editor.icon.disable_icon_animations'),
                value: 'disable_icon_animation',
              },
            ],
          },
        },
      },
    ],
  };
};

export const getOccupancySchema = (
  hass: HomeAssistant,
  entities: string[],
): HaFormSchema[] => {
  return [
    getAlarmConfigSchema(hass, entities, 'occupancy'),
    getAlarmConfigSchema(hass, entities, 'smoke'),
    getAlarmConfigSchema(hass, entities, 'gas'),
    getAlarmConfigSchema(hass, entities, 'water'),
  ];
};

const featuresSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    type: 'expandable' as const,
    flatten: true,
    icon: 'mdi:list-box',
    schema: [
      {
        name: 'features',
        label: 'editor.features.features',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list' as const,
            options: [
              {
                label: localize(hass, 'editor.stats.hide_area_stats'),
                value: 'hide_area_stats',
              },
              {
                label: localize(hass, 'editor.icon.hide_room_icon'),
                value: 'hide_room_icon',
              },
              {
                label: localize(hass, 'editor.styles.skip_climate_styles'),
                value: 'skip_climate_styles',
              },
              {
                label: localize(
                  hass,
                  'editor.card.skip_card_background_styles',
                ),
                value: 'skip_entity_styles',
              },
              {
                label: localize(hass, 'editor.features.full_card_actions'),
                value: 'full_card_actions',
              },
            ],
          },
        },
      },
    ],
  };
};

/**
 * Returns schema for entity-specific features only
 * Filters the full features list to only include entity-related features
 */
export const entityFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.entity.show_entity_labels'),
            value: 'show_entity_labels',
          },
          {
            label: localize(hass, 'editor.features.exclude_default_entities'),
            value: 'exclude_default_entities',
          },
          {
            label: localize(hass, 'editor.entity.ignore_entity'),
            value: 'ignore_entity',
          },
          {
            label: localize(hass, 'editor.features.sticky_entities'),
            value: 'sticky_entities',
          },
          {
            label: localize(hass, 'editor.features.slider'),
            value: 'slider',
          },
          {
            label: localize(hass, 'editor.features.hide_hidden_entities'),
            value: 'hide_hidden_entities',
          },
        ],
      },
    },
  };
};

/**
 * Returns schema for lights-specific features only
 */
export const lightsFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.background.multi_light_background'),
            value: 'multi_light_background',
          },
        ],
      },
    },
  };
};

/**
 * Returns schema for sensors-specific features only
 */
export const sensorsFeaturesSchema = (hass: HomeAssistant): HaFormSchema => {
  return {
    name: 'features',
    label: 'editor.features.features',
    required: false,
    selector: {
      select: {
        multiple: true,
        mode: 'list' as const,
        options: [
          {
            label: localize(hass, 'editor.sensor.hide_sensors'),
            value: 'hide_climate_label',
          },
          {
            label: localize(hass, 'editor.sensor.hide_sensor_icons'),
            value: 'hide_sensor_icons',
          },
          {
            label: localize(hass, 'editor.sensor.hide_sensor_labels'),
            value: 'hide_sensor_labels',
          },
        ],
      },
    },
  };
};
