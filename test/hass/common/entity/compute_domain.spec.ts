import { computeDomain } from '@hass/common/entity/compute_domain';
import { expect } from 'chai';

describe('compute_domain.ts', () => {
  it('should extract domain from entity ID', () => {
    expect(computeDomain('light.living_room')).to.equal('light');
    expect(computeDomain('sensor.temperature')).to.equal('sensor');
    expect(computeDomain('climate.thermostat')).to.equal('climate');
  });

  it('should extract complex domain names', () => {
    expect(computeDomain('media_player.tv')).to.equal('media_player');
    expect(computeDomain('vacuum.roomba')).to.equal('vacuum');
    expect(computeDomain('device_tracker.phone')).to.equal('device_tracker');
  });

  it('should handle entity IDs with multiple dots', () => {
    expect(computeDomain('sensor.outdoor.temperature')).to.equal('sensor');
    expect(computeDomain('binary_sensor.door.front.status')).to.equal(
      'binary_sensor',
    );
  });

  it('should handle unusual entity IDs', () => {
    expect(computeDomain('custom_domain.entity_with_underscores')).to.equal(
      'custom_domain',
    );
    expect(computeDomain('domain123.entity456')).to.equal('domain123');
  });

  // Edge case tests
  it('should handle edge cases', () => {
    // This test may fail if implementation doesn't handle this case
    // Technically an invalid entity ID but testing the function's behavior
    expect(computeDomain('invalid_entity_id')).to.equal('');
  });
});
