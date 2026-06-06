import { expect } from 'chai';
import {
  configWithDebugPanelData,
  debugPanelDataFromConfig,
  formatDebugYamlSnippet,
  getActiveDebugPresetId,
  normalizeDebug,
} from '../../src/editor/utils/debug-config';
import type { Config } from '../../src/types/config';

describe('debug-config utils', () => {
  const baseConfig = { area: 'living_room' } as Config;

  it('normalizes empty filters to log-everything debug object', () => {
    expect(normalizeDebug({ scope: [], categories: [] })).to.deep.equal({});
  });

  it('maps config to panel data', () => {
    const config: Config = {
      ...baseConfig,
      debug: { categories: ['render'], scope: ['room-summary-card'] },
    };
    expect(debugPanelDataFromConfig(config)).to.deep.equal({
      enabled: true,
      categories: ['render'],
      scope: ['room-summary-card'],
    });
  });

  it('removes debug when panel is disabled', () => {
    const config: Config = {
      ...baseConfig,
      debug: { categories: ['render'] },
    };
    const next = configWithDebugPanelData(config, {
      enabled: false,
      categories: [],
      scope: [],
    });
    expect(next.debug).to.equal(undefined);
  });

  it('applies panel filters to config', () => {
    const next = configWithDebugPanelData(baseConfig, {
      enabled: true,
      categories: ['render'],
      scope: [],
    });
    expect(next.debug).to.deep.equal({ categories: ['render'] });
  });

  it('formats yaml snippet for renders preset', () => {
    const snippet = formatDebugYamlSnippet({ categories: ['render'] });
    expect(snippet).to.include('categories:');
    expect(snippet).to.include('- render');
  });

  it('formats yaml snippet when all logging is enabled', () => {
    const snippet = formatDebugYamlSnippet({});
    expect(snippet).to.include('debug:');
    expect(snippet).to.include('all components');
  });

  it('detects active render preset', () => {
    const config: Config = {
      ...baseConfig,
      debug: { categories: ['render'] },
    };
    expect(getActiveDebugPresetId(config)).to.equal('renders');
  });
});
