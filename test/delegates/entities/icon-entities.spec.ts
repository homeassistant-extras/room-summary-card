import type { Config } from '@/types/config';
import { getIconEntities } from '@delegates/entities/icon-entities';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import { expect } from 'chai';

describe('icon-entities.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.test': e('light', 'test'),
        'light.test_room_light': e('light', 'test_room_light', 'on'),
        'switch.test_room_fan': e('switch', 'test_room_fan', 'off'),
      },
      entities: {
        'light.test': {
          device_id: 'device_1',
          area_id: 'area_1',
          labels: [],
        },
        'light.test_room_light': {
          device_id: 'device_2',
          area_id: 'test_room',
          labels: [],
        },
        'switch.test_room_fan': {
          device_id: 'device_3',
          area_id: 'test_room',
          labels: [],
        },
      },
      devices: {
        device_1: {
          area_id: 'area_1',
        },
        device_2: {
          area_id: 'test_room',
        },
        device_3: {
          area_id: 'test_room',
        },
      },
      areas: {
        area_1: {
          area_id: 'area_1',
          icon: 'mdi:home',
        },
        test_room: {
          area_id: 'test_room',
          icon: 'mdi:room',
        },
      },
    } as any;
  });

  it('should return configured entities', () => {
    const config = {
      area: 'test_room',
      entities: ['light.test'],
    };

    const entities = getIconEntities(mockHass, config);
    expect(entities).to.have.lengthOf(3); // Base entities + configured entity
    expect(entities[2]!.config.entity_id).to.equal('light.test');
  });

  it('should return base entities by default', () => {
    const config = {
      area: 'test_room',
    };

    const entities = getIconEntities(mockHass, config);
    expect(entities).to.have.lengthOf(2);
    expect(entities[0]!.config.entity_id).to.equal('light.test_room_light');
    expect(entities[1]!.config.entity_id).to.equal('switch.test_room_fan');
  });

  it('should not return base entities when exclude_default_entities is set', () => {
    const config = {
      area: 'test_room',
      features: ['exclude_default_entities'],
      entities: ['light.test'],
    } as any as Config;

    const entities = getIconEntities(mockHass, config);
    expect(entities).to.have.lengthOf(1);
    expect(entities[0]!.config.entity_id).to.equal('light.test');
  });

  it('should handle missing base entities gracefully', () => {
    const config = {
      area: 'nonexistent_room',
    };

    const entities = getIconEntities(mockHass, config);
    expect(entities).to.have.lengthOf(0);
  });

  it('should handle entity config objects', () => {
    const config = {
      area: 'test_room',
      entities: [
        {
          entity_id: 'light.test',
          icon: 'mdi:custom',
          tap_action: { action: 'custom' },
        },
      ],
    } as any as Config;

    const entities = getIconEntities(mockHass, config);
    expect(entities).to.have.lengthOf(3);
    expect(entities[2]!.config.icon).to.equal('mdi:custom');
    expect(entities[2]!.config.tap_action!.action).to.equal('custom');
  });

  it('should merge default actions with entity config', () => {
    const config = {
      area: 'test_room',
      entities: [
        {
          entity_id: 'light.test',
          tap_action: { action: 'custom' },
        },
      ],
    } as any as Config;

    const entities = getIconEntities(mockHass, config);
    const customEntity = entities[2]!;
    expect(customEntity.config.tap_action!.action).to.equal('custom');
    expect(customEntity.config.hold_action!.action).to.equal('more-info');
    expect(customEntity.config.double_tap_action!.action).to.equal('none');
  });

  it('should apply climate icons when domain is climate and skip_climate_styles is not set', () => {
    // Add a climate entity to the mock
    mockHass.states['climate.test_room_thermostat'] = e(
      'climate',
      'test_room_thermostat',
      'heat',
    );
    mockHass.entities['climate.test_room_thermostat'] = {
      entity_id: 'climate.test_room_thermostat',
      device_id: 'device_4',
      area_id: 'test_room',
      labels: [],
    };

    const config = {
      area: 'test_room',
      entities: ['climate.test_room_thermostat'],
    };

    const entities = getIconEntities(mockHass, config);
    // Find the climate entity in the results
    const climateEntity = entities.find(
      (e) => e.config.entity_id === 'climate.test_room_thermostat',
    );

    expect(climateEntity).to.exist;
    expect(climateEntity!.state!.attributes.icon).to.equal('mdi:fire'); // 'heat' state should map to 'mdi:fire' icon
  });

  it('should not apply climate icons when skip_climate_styles feature is enabled', () => {
    // Add a climate entity to the mock
    mockHass.states['climate.test_room_thermostat'] = e(
      'climate',
      'test_room_thermostat',
      'heat',
    );
    mockHass.entities['climate.test_room_thermostat'] = {
      entity_id: 'climate.test_room_thermostat',
      device_id: 'device_4',
      area_id: 'test_room',
      labels: [],
    };

    const config = {
      area: 'test_room',
      features: ['skip_climate_styles'],
      entities: ['climate.test_room_thermostat'],
    } as any as Config;

    const entities = getIconEntities(mockHass, config);
    // Find the climate entity in the results
    const climateEntity = entities.find(
      (e) => e.config.entity_id === 'climate.test_room_thermostat',
    );

    expect(climateEntity).to.exist;
    expect(climateEntity!.state!.attributes.icon).to.be.undefined; // No icon should be applied
  });
});
