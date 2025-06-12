import * as featureModule from '@config/feature';
import * as stateActiveModule from '@hass/common/entity/state_active';
import { getBackgroundOpacity } from '@theme/background/background-bits';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('background-bits.ts', () => {
    let mockHass: any;
    let hasFeatureStub: SinonStub;
    let stateActiveStub: SinonStub;

    beforeEach(() => {
      hasFeatureStub = stub(featureModule, 'hasFeature');
      stateActiveStub = stub(stateActiveModule, 'stateActive');

      // Default stub behaviors
      hasFeatureStub.returns(false);
      stateActiveStub.returns(false);

      mockHass = {
        themes: { darkMode: false },
      };
    });

    afterEach(() => {
      hasFeatureStub.restore();
      stateActiveStub.restore();
    });

    describe('getBackgroundOpacity', () => {
      it('should return configured opacit', () => {
        const config: Config = { area: 'test', background: { opacity: 50 } };
        const result = getBackgroundOpacity(mockHass, config);

        expect(result).to.deep.equal({
          '--opacity-theme': 0.5,
          '--background-opacity-card': `var(--opacity-background-inactive)`,
        });
      });

      it('should return inactive opacity by default', () => {
        const config: Config = { area: 'test' };
        const result = getBackgroundOpacity(mockHass, config);

        expect(result).to.deep.equal({
          '--opacity-theme': undefined,
          '--background-opacity-card': `var(--opacity-background-inactive)`,
        });
      });

      it('should return active opacity in dark mode when entity is active', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);

        const config: Config = { area: 'test' };
        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
        } as EntityState;
        const result = getBackgroundOpacity(mockHass, config, mockState);

        expect(result).to.deep.equal({
          '--opacity-theme': undefined,
          '--background-opacity-card': `var(--opacity-background-active)`,
        });
      });

      it('should use inactive opacity when skip_entity_styles is enabled', () => {
        mockHass.themes.darkMode = true;
        stateActiveStub.returns(true);
        hasFeatureStub
          .withArgs({ area: 'test' }, 'skip_entity_styles')
          .returns(true);

        const config: Config = { area: 'test' };
        const mockState = {
          entity_id: 'light.test',
          state: 'on',
          domain: 'light',
        } as EntityState;
        const result = getBackgroundOpacity(mockHass, config, mockState);

        expect(result).to.deep.equal({
          '--opacity-theme': undefined,
          '--background-opacity-card': 'var(--opacity-background-inactive)',
        });
      });
    });
  });
};
