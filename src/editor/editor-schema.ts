import { computeDomain } from '@hass/common/entity/compute_domain';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import { getSensorNumericDeviceClasses } from '@hass/data/sensor';
import type { HomeAssistant } from '@hass/types';
import {
  CONTENT,
  FEATURES,
  INTERACTIONS,
  MAIN,
  STYLES,
} from './schema-constants';

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
    FEATURES,
    STYLES,
    INTERACTIONS,
  ];
};
