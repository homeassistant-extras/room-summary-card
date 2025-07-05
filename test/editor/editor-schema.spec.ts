import { getSchema } from '@/editor/editor-schema';
import * as sensorModule from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('editor-schema.ts', () => {
  let mockHass: HomeAssistant;
  let getSensorNumericDeviceClassesStub: SinonStub;

  beforeEach(() => {
    mockHass = {
      states: {
        'sensor.living_room_temperature': {
          entity_id: 'sensor.living_room_temperature',
          state: '72',
          attributes: {
            device_class: 'temperature',
            unit_of_measurement: '°F',
          },
        },
        'sensor.living_room_humidity': {
          entity_id: 'sensor.living_room_humidity',
          state: '45',
          attributes: {
            device_class: 'humidity',
            unit_of_measurement: '%',
          },
        },
        'sensor.living_room_pressure': {
          entity_id: 'sensor.living_room_pressure',
          state: '1013',
          attributes: {
            device_class: 'pressure',
            unit_of_measurement: 'hPa',
          },
        },
        'light.living_room': {
          entity_id: 'light.living_room',
          state: 'on',
          attributes: {},
        },
      },
      entities: {
        'sensor.living_room_temperature': {
          entity_id: 'sensor.living_room_temperature',
          device_id: 'device_1',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.living_room_humidity': {
          entity_id: 'sensor.living_room_humidity',
          device_id: 'device_2',
          area_id: 'living_room',
          labels: [],
        },
        'sensor.living_room_pressure': {
          entity_id: 'sensor.living_room_pressure',
          device_id: 'device_3',
          area_id: 'living_room',
          labels: [],
        },
        'light.living_room': {
          entity_id: 'light.living_room',
          device_id: 'device_4',
          area_id: 'living_room',
          labels: [],
        },
      },
      devices: {
        device_1: { area_id: 'living_room' },
        device_2: { area_id: 'living_room' },
        device_3: { area_id: 'living_room' },
        device_4: { area_id: 'living_room' },
      },
      areas: {
        living_room: {
          area_id: 'living_room',
          name: 'Living Room',
          icon: 'mdi:sofa',
        },
      },
    } as any as HomeAssistant;

    getSensorNumericDeviceClassesStub = stub(
      sensorModule,
      'getSensorNumericDeviceClasses',
    );
    getSensorNumericDeviceClassesStub.resolves({
      numeric_device_classes: [
        'temperature',
        'humidity',
        'pressure',
        'battery',
        'illuminance',
      ],
    });
  });

  afterEach(() => {
    getSensorNumericDeviceClassesStub.restore();
  });

  describe('getSchema', () => {
    it('should return schema with sensor classes from area', async () => {
      const schema = await getSchema(mockHass, 'living_room');
      const entities = Object.keys(mockHass.entities);

      expect(schema).to.deep.equal([
        {
          name: 'area',
          label: 'Area',
          required: true,
          selector: { area: {} },
        },
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
              selector: {
                entity: { multiple: false, include_entities: entities },
              },
            },
            {
              name: 'entities',
              label: 'Area side entities',
              required: false,
              selector: {
                entity: { multiple: true, include_entities: entities },
              },
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
                  options: ['temperature', 'humidity', 'pressure'],
                },
              },
            },
          ],
        },
        {
          name: 'occupancy',
          label: 'Occupancy & Presence Detection',
          type: 'expandable' as const,
          icon: 'mdi:motion-sensor',
          schema: [
            {
              name: 'entities',
              label: 'Motion/Occupancy/Presence Sensors',
              required: true,
              selector: {
                entity: {
                  multiple: true,
                  filter: {
                    domain: ['binary_sensor'],
                    device_class: ['motion', 'occupancy', 'presence'],
                  },
                },
              },
            },
            {
              name: 'card_border_color',
              label: 'Card Border Color (Occupied)',
              required: false,
              selector: { text: { type: 'color' as const } },
            },
            {
              name: 'icon_color',
              label: 'Icon Background Color (Occupied)',
              required: false,
              selector: { text: { type: 'color' as const } },
            },
            {
              name: 'options',
              label: 'Options',
              required: false,
              selector: {
                select: {
                  multiple: true,
                  mode: 'list' as const,
                  options: [
                    {
                      label: 'Disable Card Border',
                      value: 'disabled_card_styles',
                    },
                    {
                      label: 'Disable Card Border Animations',
                      value: 'disabled_card_styles_animation',
                    },
                    {
                      label: 'Disable Icon Color',
                      value: 'disable_icon_styles',
                    },
                    {
                      label: 'Disable Icon Animations',
                      value: 'disable_icon_animation',
                    },
                  ],
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
                    { label: 'Hide Area Stats', value: 'hide_area_stats' },
                    {
                      label: 'Hide Sensors',
                      value: 'hide_climate_label',
                    },
                    { label: 'Hide Room Icon', value: 'hide_room_icon' },
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
            {
              name: 'background',
              label: 'Background',
              type: 'expandable',
              icon: 'mdi:format-paint',
              schema: [
                {
                  name: 'image',
                  label: 'Background Image',
                  selector: { image: {} },
                },
                {
                  name: 'image_entity',
                  label: 'Background Image Entity',
                  selector: {
                    entity: { filter: { domain: ['image', 'person'] } },
                  },
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
                  label: 'Entities Styles',
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
      ]);
    });
  });
});
