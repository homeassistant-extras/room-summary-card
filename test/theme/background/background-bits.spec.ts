import * as featureModule from '@config/feature';
import { getBackgroundOpacity } from '@theme/background/background-bits';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('background-bits.ts', () => {
  let hasFeatureStub: SinonStub;

  beforeEach(() => {
    hasFeatureStub = stub(featureModule, 'hasFeature');

    // Default stub behavior
    hasFeatureStub.returns(false);
  });

  afterEach(() => {
    hasFeatureStub.restore();
  });

  describe('getBackgroundOpacity', () => {
    it('should return configured opacity', () => {
      const config: Config = { area: 'test', background: { opacity: 50 } };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--opacity-theme': 0.5,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should return inactive opacity by default', () => {
      const config: Config = { area: 'test' };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--opacity-theme': undefined,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should return active opacity when active is true', () => {
      const config: Config = { area: 'test' };
      const result = getBackgroundOpacity(config, true);

      expect(result).to.deep.equal({
        '--opacity-theme': undefined,
        '--background-opacity-card': `var(--opacity-background-active)`,
      });
    });

    it('should use inactive opacity when skip_entity_styles is enabled', () => {
      hasFeatureStub
        .withArgs({ area: 'test' }, 'skip_entity_styles')
        .returns(true);

      const config: Config = { area: 'test' };
      const result = getBackgroundOpacity(config, true);

      expect(result).to.deep.equal({
        '--opacity-theme': undefined,
        '--background-opacity-card': 'var(--opacity-background-inactive)',
      });
    });

    it('should not set opacity-theme when icon_background option is set', () => {
      const config: Config = {
        area: 'test',
        background: {
          opacity: 50,
          options: ['icon_background'],
        },
      };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--opacity-theme': undefined,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should set opacity-theme when icon_background option is not set', () => {
      const config: Config = {
        area: 'test',
        background: {
          opacity: 50,
        },
      };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--opacity-theme': 0.5,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });
  });
});
