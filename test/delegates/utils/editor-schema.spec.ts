import { getSchema } from '@delegates/utils/editor-schema';
import * as sensorModule from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

export default () => {
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
                label: 'Sensor states',
                required: false,
                selector: { entity: { multiple: true } },
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
        ]);
      });
    });
  });
};
