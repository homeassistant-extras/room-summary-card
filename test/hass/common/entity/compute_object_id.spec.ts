import { computeObjectId } from '@hass/common/entity/compute_object_id';
import { expect } from 'chai';

describe('compute_object_id.ts', () => {
  it('should extract object ID from entity ID', () => {
    expect(computeObjectId('light.living_room')).to.equal('living_room');
    expect(computeObjectId('sensor.temperature')).to.equal('temperature');
    expect(computeObjectId('climate.thermostat')).to.equal('thermostat');
  });

  it('should handle entity IDs with multiple underscores', () => {
    expect(computeObjectId('sensor.outdoor_temperature')).to.equal(
      'outdoor_temperature',
    );
    expect(computeObjectId('binary_sensor.front_door_contact')).to.equal(
      'front_door_contact',
    );
    expect(computeObjectId('media_player.living_room_tv')).to.equal(
      'living_room_tv',
    );
  });

  it('should handle entity IDs with numbers', () => {
    expect(computeObjectId('sensor.temp_1')).to.equal('temp_1');
    expect(computeObjectId('light.lamp_2')).to.equal('lamp_2');
    expect(computeObjectId('switch.outlet_3')).to.equal('outlet_3');
  });

  it('should handle complex entity IDs', () => {
    expect(computeObjectId('device_tracker.iphone_patrick')).to.equal(
      'iphone_patrick',
    );
    expect(computeObjectId('vacuum.roomba_kitchen')).to.equal('roomba_kitchen');
    expect(computeObjectId('camera.front_door_camera')).to.equal(
      'front_door_camera',
    );
  });

  it('should handle edge cases', () => {
    // When there's no dot, indexOf returns -1, so substr(-1 + 1) = substr(0)
    // This returns the entire string
    expect(computeObjectId('invalid_entity_id')).to.equal('invalid_entity_id');
  });
});
