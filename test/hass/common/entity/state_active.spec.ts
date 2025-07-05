import { stateActive } from '@hass/common/entity/state_active';
import { OFF, UNAVAILABLE } from '@hass/data/entity';
import { expect } from 'chai';

describe('state_active.ts', () => {
  // Helper function to create state objects for testing
  const createStateObj = (entityId: string, state: string) => ({
    entity_id: entityId,
    state,
    attributes: {},
    last_changed: '',
    last_updated: '',
    context: { id: '', parent_id: null, user_id: null },
  });

  describe('Generic state behavior', () => {
    it('should return false for unavailable states', () => {
      const stateObj = createStateObj('light.test', UNAVAILABLE);
      expect(stateActive(stateObj)).to.be.false;
    });

    it('should return false for "off" state in most domains', () => {
      const stateObj = createStateObj('light.test', OFF);
      expect(stateActive(stateObj)).to.be.false;
    });

    it('should return true for other standard states', () => {
      const stateObj = createStateObj('light.test', 'on');
      expect(stateActive(stateObj)).to.be.true;
    });

    it('should use provided state instead of state object when available', () => {
      const stateObj = createStateObj('light.test', 'on');
      expect(stateActive(stateObj, OFF)).to.be.false;
      expect(stateActive(stateObj, 'on')).to.be.true;
    });
  });

  describe('Button-like domains', () => {
    const buttonLikeDomains = ['button', 'event', 'input_button', 'scene'];

    buttonLikeDomains.forEach((domain) => {
      it(`should return true for ${domain} when not unavailable`, () => {
        const stateObj = createStateObj(`${domain}.test`, 'pressed');
        expect(stateActive(stateObj)).to.be.true;
      });

      it(`should return false for ${domain} when unavailable`, () => {
        const stateObj = createStateObj(`${domain}.test`, UNAVAILABLE);
        expect(stateActive(stateObj)).to.be.false;
      });
    });
  });

  describe('Domain-specific behavior', () => {
    it('should handle alarm_control_panel domain', () => {
      const domain = 'alarm_control_panel';
      expect(stateActive(createStateObj(`${domain}.test`, 'disarmed'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'armed_home'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'armed_away'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'triggered'))).to.be
        .true;
    });

    it('should handle alert domain', () => {
      const domain = 'alert';
      expect(stateActive(createStateObj(`${domain}.test`, 'idle'))).to.be.false;
      expect(stateActive(createStateObj(`${domain}.test`, OFF))).to.be.true;
      expect(stateActive(createStateObj(`${domain}.test`, 'on'))).to.be.true;
    });

    it('should handle cover domain', () => {
      const domain = 'cover';
      expect(stateActive(createStateObj(`${domain}.test`, 'closed'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'open'))).to.be.true;
      expect(stateActive(createStateObj(`${domain}.test`, 'opening'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'closing'))).to.be
        .true;
    });

    it('should handle person and device_tracker domains', () => {
      ['person', 'device_tracker'].forEach((domain) => {
        expect(stateActive(createStateObj(`${domain}.test`, 'not_home'))).to.be
          .false;
        expect(stateActive(createStateObj(`${domain}.test`, 'home'))).to.be
          .true;
        expect(stateActive(createStateObj(`${domain}.test`, 'work'))).to.be
          .true;
      });
    });

    it('should handle lawn_mower domain', () => {
      const domain = 'lawn_mower';
      expect(stateActive(createStateObj(`${domain}.test`, 'mowing'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'error'))).to.be.true;
      expect(stateActive(createStateObj(`${domain}.test`, 'docked'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'paused'))).to.be
        .false;
    });

    it('should handle lock domain', () => {
      const domain = 'lock';
      expect(stateActive(createStateObj(`${domain}.test`, 'locked'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'unlocked'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'jammed'))).to.be
        .true;
    });

    it('should handle media_player domain', () => {
      const domain = 'media_player';
      expect(stateActive(createStateObj(`${domain}.test`, 'standby'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'playing'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'paused'))).to.be
        .true;
    });

    it('should handle vacuum domain', () => {
      const domain = 'vacuum';
      expect(stateActive(createStateObj(`${domain}.test`, 'idle'))).to.be.false;
      expect(stateActive(createStateObj(`${domain}.test`, 'docked'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'paused'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'cleaning'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'returning'))).to.be
        .true;
    });

    it('should handle valve domain', () => {
      const domain = 'valve';
      expect(stateActive(createStateObj(`${domain}.test`, 'closed'))).to.be
        .false;
      expect(stateActive(createStateObj(`${domain}.test`, 'open'))).to.be.true;
      expect(stateActive(createStateObj(`${domain}.test`, 'opening'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'closing'))).to.be
        .true;
    });

    it('should handle plant domain', () => {
      const domain = 'plant';
      expect(stateActive(createStateObj(`${domain}.test`, 'ok'))).to.be.false;
      expect(stateActive(createStateObj(`${domain}.test`, 'problem'))).to.be
        .true;
    });

    it('should handle group domain', () => {
      const domain = 'group';
      const activeStates = ['on', 'home', 'open', 'locked', 'problem'];
      const inactiveStates = ['off', 'not_home', 'closed', 'unlocked', 'ok'];

      activeStates.forEach((state) => {
        expect(stateActive(createStateObj(`${domain}.test`, state))).to.be.true;
      });

      inactiveStates.forEach((state) => {
        expect(stateActive(createStateObj(`${domain}.test`, state))).to.be
          .false;
      });
    });

    it('should handle timer domain', () => {
      const domain = 'timer';
      expect(stateActive(createStateObj(`${domain}.test`, 'active'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'idle'))).to.be.false;
      expect(stateActive(createStateObj(`${domain}.test`, 'paused'))).to.be
        .false;
    });

    it('should handle camera domain', () => {
      const domain = 'camera';
      expect(stateActive(createStateObj(`${domain}.test`, 'streaming'))).to.be
        .true;
      expect(stateActive(createStateObj(`${domain}.test`, 'idle'))).to.be.false;
      expect(stateActive(createStateObj(`${domain}.test`, 'recording'))).to.be
        .false;
    });
  });

  describe('Default behavior', () => {
    it('should return true for domains not explicitly handled', () => {
      const stateObj = createStateObj('custom_domain.test', 'any_state');
      expect(stateActive(stateObj)).to.be.true;
    });
  });
});
