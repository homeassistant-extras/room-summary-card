import { batteryStateColorProperty } from '@hass/common/entity/color/battery_color';
import { expect } from 'chai';

export default () => {
  describe('battery_color.ts', () => {
    it('should return high color for values >= 70', () => {
      expect(batteryStateColorProperty('70')).to.equal(
        '--state-sensor-battery-high-color',
      );
      expect(batteryStateColorProperty('85')).to.equal(
        '--state-sensor-battery-high-color',
      );
      expect(batteryStateColorProperty('100')).to.equal(
        '--state-sensor-battery-high-color',
      );
    });

    it('should return medium color for values >= 30 and < 70', () => {
      expect(batteryStateColorProperty('30')).to.equal(
        '--state-sensor-battery-medium-color',
      );
      expect(batteryStateColorProperty('45')).to.equal(
        '--state-sensor-battery-medium-color',
      );
      expect(batteryStateColorProperty('69')).to.equal(
        '--state-sensor-battery-medium-color',
      );
    });

    it('should return low color for values < 30', () => {
      expect(batteryStateColorProperty('0')).to.equal(
        '--state-sensor-battery-low-color',
      );
      expect(batteryStateColorProperty('15')).to.equal(
        '--state-sensor-battery-low-color',
      );
      expect(batteryStateColorProperty('29')).to.equal(
        '--state-sensor-battery-low-color',
      );
    });

    it('should return undefined for non-numeric values', () => {
      expect(batteryStateColorProperty('unknown')).to.be.undefined;
      expect(batteryStateColorProperty('unavailable')).to.be.undefined;
      expect(batteryStateColorProperty('charging')).to.be.undefined;
    });

    it('should handle edge cases', () => {
      expect(batteryStateColorProperty('-10')).to.equal(
        '--state-sensor-battery-low-color',
      );
      expect(batteryStateColorProperty('101')).to.equal(
        '--state-sensor-battery-high-color',
      );
      expect(batteryStateColorProperty('')).to.equal(
        '--state-sensor-battery-low-color',
      );
      expect(batteryStateColorProperty('foo')).to.be.undefined;
    });
  });
};
