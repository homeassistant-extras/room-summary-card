import { getRoomEntity } from '@delegates/entities/room-entity';
import type { NavigateActionConfig } from '@hass/data/lovelace/config/action';
import type { HomeAssistant } from '@hass/types';
import { createStateEntity as e } from '@test/test-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('room-entity.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.test_room_light': e('light', 'test_room_light', 'on'),
        'light.custom_entity': e('light', 'custom_entity', 'off'),
      },
      entities: {
        'light.test_room_light': {
          device_id: 'device_1',
          area_id: 'test_room',
          labels: [],
        },
        'light.custom_entity': {
          device_id: 'device_2',
          area_id: 'custom_area',
          labels: [],
        },
      },
      devices: {
        device_1: {
          area_id: 'test_room',
        },
        device_2: {
          area_id: 'custom_area',
        },
      },
      areas: {
        test_room: {
          area_id: 'test_room',
          icon: 'mdi:room',
        },
        custom_area: {
          area_id: 'custom_area',
          icon: 'mdi:custom',
        },
      },
    } as any as HomeAssistant;
  });

  it('should return default room entity when no custom entity specified', () => {
    const config: Config = {
      area: 'test_room',
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.entity_id).to.equal('light.test_room_light');
    expect(roomEntity.config.icon).to.equal('mdi:room');
    expect(roomEntity.config.tap_action?.action).to.equal('navigate');
    expect(roomEntity.config.hold_action?.action).to.equal('more-info');
    expect(roomEntity.config.double_tap_action?.action).to.equal('none');
    expect(roomEntity.state?.state).to.equal('on');
  });

  it('should use custom navigation path when specified', () => {
    const config: Config = {
      area: 'test_room',
      navigate: 'custom-path',
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.tap_action?.action).to.equal('navigate');
    expect(
      (roomEntity.config.tap_action as NavigateActionConfig)?.navigation_path,
    ).to.equal('custom-path');
  });

  it('should return room entity with string entity configuration', () => {
    const config: Config = {
      area: 'test_room',
      entity: 'light.custom_entity',
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
    expect(roomEntity.state?.state).to.equal('off');
    expect(roomEntity.config.hold_action?.action).to.equal('more-info');
    expect(roomEntity.config.double_tap_action?.action).to.equal('none');
  });

  it('should return room entity with object entity configuration', () => {
    const config: Config = {
      area: 'test_room',
      entity: {
        entity_id: 'light.custom_entity',
        icon: 'mdi:override',
        tap_action: {
          action: 'toggle',
        },
      },
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
    expect(roomEntity.config.icon).to.equal('mdi:override');
    expect(roomEntity.config.tap_action?.action).to.equal('toggle');
    expect(roomEntity.config.hold_action?.action).to.equal('more-info');
    expect(roomEntity.config.double_tap_action?.action).to.equal('none');
    expect(roomEntity.state?.state).to.equal('off');
  });

  it('should handle non-existent entity gracefully by creating fake state', () => {
    const config: Config = {
      area: 'non_existent_room',
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.entity_id).to.equal(
      'light.non_existent_room_light',
    );
    expect(roomEntity.state?.entity_id).to.equal(
      'light.non_existent_room_light',
    );
    // Verify it's a fake state by checking if attributes is undefined
    expect(roomEntity.state?.attributes).to.deep.equal({});
  });

  it('should preserve custom entity config with defaults', () => {
    const config: Config = {
      area: 'test_room',
      entity: {
        entity_id: 'light.custom_entity',
        icon: 'icon',
        // Intentionally omitting hold_action and double_tap_action
      },
    };

    const roomEntity = getRoomEntity(mockHass, config);

    expect(roomEntity.config.entity_id).to.equal('light.custom_entity');
    expect(roomEntity.config.icon).to.equal('icon');
    // Should have defaults for these
    expect(roomEntity.config.hold_action?.action).to.equal('more-info');
    expect(roomEntity.config.double_tap_action?.action).to.equal('none');
  });

  it('should provide consistent action config across all three scenarios', () => {
    // Define the expected structure of action config
    const expectedActionConfig = {
      tap_action: {
        action: 'navigate',
        navigation_path: 'test-room', // For this test we're using the default path
      },
      hold_action: {
        action: 'more-info',
      },
      double_tap_action: {
        action: 'none',
      },
    };

    // Scenario 1: Default case (no entity specified)
    const config1: Config = {
      area: 'test_room',
    };
    const roomEntity1 = getRoomEntity(mockHass, config1);

    // Scenario 2: String entity specified
    const config2: Config = {
      area: 'test_room',
      entity: 'light.custom_entity',
    };
    const roomEntity2 = getRoomEntity(mockHass, config2);

    // Scenario 3: Object entity specified (without overriding actions)
    const config3: Config = {
      area: 'test_room',
      entity: {
        entity_id: 'light.custom_entity',
        icon: 'mdi:custom',
      },
    };
    const roomEntity3 = getRoomEntity(mockHass, config3);

    // Verify action configs are consistent
    // Scenario 1
    expect(roomEntity1.config.tap_action).to.deep.include(
      expectedActionConfig.tap_action,
    );
    expect(roomEntity1.config.hold_action).to.deep.equal(
      expectedActionConfig.hold_action,
    );
    expect(roomEntity1.config.double_tap_action).to.deep.equal(
      expectedActionConfig.double_tap_action,
    );

    // Scenario 2
    expect(roomEntity2.config.tap_action).to.deep.include(
      expectedActionConfig.tap_action,
    );
    expect(roomEntity2.config.hold_action).to.deep.equal(
      expectedActionConfig.hold_action,
    );
    expect(roomEntity2.config.double_tap_action).to.deep.equal(
      expectedActionConfig.double_tap_action,
    );

    // Scenario 3
    expect(roomEntity3.config.tap_action).to.deep.include(
      expectedActionConfig.tap_action,
    );
    expect(roomEntity3.config.hold_action).to.deep.equal(
      expectedActionConfig.hold_action,
    );
    expect(roomEntity3.config.double_tap_action).to.deep.equal(
      expectedActionConfig.double_tap_action,
    );
  });
});
