import { feature } from '@common/feature';
import type { Config, Features } from '@type/config';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('feature', () => {
  it('should return true when config is null', () => {
    expect(feature(null as any as Config, 'hide_area_stats')).to.be.true;
  });

  it('should return true when config is undefined', () => {
    expect(feature(undefined as any as Config, 'hide_area_stats')).to.be.true;
  });

  it('should return false when config.features is undefined', () => {
    const config = {} as Config;
    expect(feature(config, 'hide_area_stats')).to.be.false;
  });

  it('should return false when config.features is empty', () => {
    const config = { area: '', features: [] } as Config;
    expect(feature(config, 'hide_area_stats')).to.be.false;
  });

  it('should return true when feature is present in config.features', () => {
    const config = {
      area: '',
      features: ['hide_area_stats', 'exclude_default_entities'],
    } as Config;
    expect(feature(config, 'hide_area_stats')).to.be.true;
  });

  it('should return false when feature is not present in config.features', () => {
    const config = {
      area: '',
      features: ['hide_climate_label', 'exclude_default_entities'],
    } as Config;
    expect(feature(config, 'hide_area_stats')).to.be.false;
  });

  it('should handle case-sensitive feature names', () => {
    const config = {
      area: '',
      features: ['hide_area_stats'],
    } as Config;
    expect(feature(config, 'exclude_default_entities')).to.be.false;
    expect(feature(config, 'hide_area_stats')).to.be.true;
  });

  // Edge cases
  it('should handle empty string feature names', () => {
    const config = { features: ['' as any as Features] } as Config;
    expect(feature(config, '' as any as Features)).to.be.true;
  });
});
