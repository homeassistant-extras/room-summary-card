import { activeColorFromDomain } from '@theme/domain-color';
import { expect } from 'chai';

export default () => {
  describe('domain-color.ts', () => {
    describe('activeColorFromDomain', () => {
      it('should return yellow for lighting domains', () => {
        expect(activeColorFromDomain('light')).to.equal('yellow');
        expect(activeColorFromDomain('switch_as_x')).to.equal('yellow');
      });

      it('should return blue for switch domains', () => {
        expect(activeColorFromDomain('switch')).to.equal('blue');
        expect(activeColorFromDomain('input_boolean')).to.equal('blue');
        expect(activeColorFromDomain('automation')).to.equal('blue');
        expect(activeColorFromDomain('script')).to.equal('blue');
      });

      it('should return teal for climate domains', () => {
        expect(activeColorFromDomain('climate')).to.equal('teal');
        expect(activeColorFromDomain('fan')).to.equal('teal');
      });

      it('should return red for security domains', () => {
        expect(activeColorFromDomain('alarm_control_panel')).to.equal('red');
        expect(activeColorFromDomain('lock')).to.equal('red');
      });

      it('should return green for cover domains', () => {
        expect(activeColorFromDomain('cover')).to.equal('green');
        expect(activeColorFromDomain('garage_door')).to.equal('green');
        expect(activeColorFromDomain('door')).to.equal('green');
      });

      it('should return indigo for media domains', () => {
        expect(activeColorFromDomain('media_player')).to.equal('indigo');
      });

      it('should return cyan for sensor domains', () => {
        expect(activeColorFromDomain('binary_sensor')).to.equal('cyan');
        expect(activeColorFromDomain('sensor')).to.equal('cyan');
      });

      it('should return purple for person domains', () => {
        expect(activeColorFromDomain('person')).to.equal('purple');
        expect(activeColorFromDomain('device_tracker')).to.equal('purple');
      });

      it('should return orange for weather domains', () => {
        expect(activeColorFromDomain('weather')).to.equal('orange');
        expect(activeColorFromDomain('update')).to.equal('orange');
      });

      it('should return deep-purple for vacuum domain', () => {
        expect(activeColorFromDomain('vacuum')).to.equal('deep-purple');
      });

      it('should return pink for timer domains', () => {
        expect(activeColorFromDomain('timer')).to.equal('pink');
        expect(activeColorFromDomain('schedule')).to.equal('pink');
      });

      it('should return yellow for unknown domains', () => {
        expect(activeColorFromDomain('unknown_domain')).to.equal('yellow');
        expect(activeColorFromDomain('another_unknown')).to.equal('yellow');
      });

      it('should return yellow for undefined domain', () => {
        expect(activeColorFromDomain(undefined)).to.equal('yellow');
      });
    });
  });
};
