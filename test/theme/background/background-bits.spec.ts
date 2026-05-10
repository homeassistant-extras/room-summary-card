import * as featureModule from '@config/feature';
import { createStateEntityForEntityId as s } from '@test/test-helpers';
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
        '--user-opacity': 0.5,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should return inactive opacity by default', () => {
      const config: Config = { area: 'test' };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--user-opacity': undefined,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should return active opacity when active is true', () => {
      const config: Config = { area: 'test' };
      const result = getBackgroundOpacity(config, true);

      expect(result).to.deep.equal({
        '--user-opacity': undefined,
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
        '--user-opacity': undefined,
        '--background-opacity-card': 'var(--opacity-background-inactive)',
      });
    });

    it('should always set --user-opacity regardless of icon_background option', () => {
      // CSS (not JS) routes --user-opacity to either the card background
      // or the icon background based on the [icon-bg] attribute.
      const config: Config = {
        area: 'test',
        background: {
          opacity: 50,
          options: ['icon_background'],
        },
      };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--user-opacity': 0.5,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should set --user-opacity when icon_background option is not set', () => {
      const config: Config = {
        area: 'test',
        background: {
          opacity: 50,
        },
      };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--user-opacity': 0.5,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should parse entity state when opacity is an entity id string', () => {
      const config: Config = {
        area: 'test',
        background: { opacity: 'sensor.room_probability' },
      };
      const opacityState = s('sensor.room_probability', '0.42');
      const result = getBackgroundOpacity(config, false, opacityState);

      expect(result).to.deep.equal({
        '--user-opacity': 0.42,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should clamp parsed entity state into [0, 1]', () => {
      const config: Config = {
        area: 'test',
        background: { opacity: 'sensor.room_probability' },
      };

      expect(
        getBackgroundOpacity(config, false, s('sensor.x', '1.5'))[
          '--user-opacity'
        ],
      ).to.equal(1);
      expect(
        getBackgroundOpacity(config, false, s('sensor.x', '-0.2'))[
          '--user-opacity'
        ],
      ).to.equal(0);
    });

    it('should leave --user-opacity undefined when opacity is a string but no state is passed', () => {
      const config: Config = {
        area: 'test',
        background: { opacity: 'sensor.room_probability' },
      };
      const result = getBackgroundOpacity(config, false);

      expect(result).to.deep.equal({
        '--user-opacity': undefined,
        '--background-opacity-card': `var(--opacity-background-inactive)`,
      });
    });

    it('should leave --user-opacity undefined when entity state is not a finite number', () => {
      const config: Config = {
        area: 'test',
        background: { opacity: 'sensor.room_probability' },
      };
      const result = getBackgroundOpacity(
        config,
        false,
        s('sensor.room_probability', 'unknown'),
      );

      expect(result['--user-opacity']).to.be.undefined;
    });
  });
});
