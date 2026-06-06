import { getEntitySuggestion } from '@delegates/utils/entity-suggestion';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { expect } from 'chai';

describe('entity-suggestion.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      entities: {
        'light.living_room_lamp': {
          entity_id: 'light.living_room_lamp',
          device_id: 'device_1',
          area_id: 'living_room',
          labels: [],
        },
        'switch.kitchen_plug': {
          // No own area_id - resolves through its device
          entity_id: 'switch.kitchen_plug',
          device_id: 'device_2',
          area_id: undefined,
          labels: [],
        },
        'sensor.orphan': {
          // No area on entity or device
          entity_id: 'sensor.orphan',
          device_id: 'device_3',
          area_id: undefined,
          labels: [],
        },
        'sensor.no_device': {
          // No device at all and no area
          entity_id: 'sensor.no_device',
          device_id: undefined,
          area_id: undefined,
          labels: [],
        },
      },
      devices: {
        device_1: { area_id: 'living_room' },
        device_2: { area_id: 'kitchen' },
        device_3: { area_id: undefined },
      },
    } as any as HomeAssistant;
  });

  it('returns two labeled variants for an entity with its own area', () => {
    const result = getEntitySuggestion(mockHass, 'light.living_room_lamp');

    expect(result).to.deep.equal([
      {
        label: 'Room summary',
        config: { type: 'custom:room-summary-card', area: 'living_room' },
      },
      {
        label: 'Room summary with featured entity',
        config: {
          type: 'custom:room-summary-card',
          area: 'living_room',
          entity: 'light.living_room_lamp',
        },
      },
    ]);
  });

  it("falls back to the device's area when the entity has none", () => {
    const result = getEntitySuggestion(mockHass, 'switch.kitchen_plug');

    expect(result).to.not.be.null;
    expect(result![0].config).to.deep.equal({
      type: 'custom:room-summary-card',
      area: 'kitchen',
    });
    expect(result![1].config).to.deep.equal({
      type: 'custom:room-summary-card',
      area: 'kitchen',
      entity: 'switch.kitchen_plug',
    });
  });

  it('always uses the custom: card type prefix', () => {
    const result = getEntitySuggestion(mockHass, 'light.living_room_lamp');

    result!.forEach((suggestion) => {
      expect(suggestion.config.type).to.equal('custom:room-summary-card');
    });
  });

  it('returns null when neither the entity nor its device has an area', () => {
    expect(getEntitySuggestion(mockHass, 'sensor.orphan')).to.be.null;
  });

  it('returns null when the entity has no device and no area', () => {
    expect(getEntitySuggestion(mockHass, 'sensor.no_device')).to.be.null;
  });

  it('returns null for an unknown entity id', () => {
    expect(getEntitySuggestion(mockHass, 'light.does_not_exist')).to.be.null;
  });
});
