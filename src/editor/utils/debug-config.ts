import { DEBUG_PRESETS, type DebugPresetId } from '@editor/debug-constants';
import type { Config } from '@type/config';
import equal from 'fast-deep-equal';

export interface DebugPanelData {
  enabled: boolean;
  scope: string[];
  categories: string[];
}

/** Normalize empty scope/category arrays so `debug: {}` means “log everything”. */
export function normalizeDebug(
  debug?: Config['debug'],
): Config['debug'] | undefined {
  if (!debug) {
    return undefined;
  }

  const scope = debug.scope?.filter((entry) => entry.length > 0) ?? undefined;
  const categories =
    debug.categories?.filter((entry) => entry.length > 0) ?? undefined;

  if (!scope?.length && !categories?.length) {
    return {};
  }

  return {
    ...(scope?.length ? { scope } : {}),
    ...(categories?.length ? { categories } : {}),
  };
}

export function debugPanelDataFromConfig(config: Config): DebugPanelData {
  const debug = config.debug;
  return {
    enabled: debug !== undefined,
    scope: [...(debug?.scope ?? [])],
    categories: [...(debug?.categories ?? [])],
  };
}

export function configWithDebugPanelData(
  config: Config,
  data: DebugPanelData,
): Config {
  const next = { ...config };

  if (!data.enabled) {
    delete next.debug;
    return next;
  }

  next.debug = normalizeDebug({
    scope: data.scope,
    categories: data.categories,
  });

  return next;
}

/** Which quick preset matches the current config, if any. */
export function getActiveDebugPresetId(config: Config): DebugPresetId | null {
  const current = config.debug;

  for (const preset of DEBUG_PRESETS) {
    if (preset.debug === undefined) {
      if (current === undefined) {
        return preset.id;
      }
      continue;
    }

    if (equal(normalizeDebug(preset.debug), normalizeDebug(current))) {
      return preset.id;
    }
  }

  return null;
}

export function formatDebugYamlSnippet(debug?: Config['debug']): string {
  if (debug === undefined) {
    return '# debug disabled';
  }

  const lines = ['debug:'];
  if (!debug.scope?.length && !debug.categories?.length) {
    lines.push('  {}  # all components and categories');
    return lines.join('\n');
  }

  if (debug.categories?.length) {
    lines.push('  categories:');
    for (const category of debug.categories) {
      lines.push(`    - ${category}`);
    }
  }

  if (debug.scope?.length) {
    lines.push('  scope:');
    for (const component of debug.scope) {
      lines.push(`    - ${component}`);
    }
  }

  return lines.join('\n');
}
