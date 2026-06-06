import {
  DEBUG_CATEGORIES,
  DEBUG_COMPONENTS,
  DEBUG_PRESETS,
  type DebugPresetId,
} from '@editor/debug-constants';
import {
  configWithDebugPanelData,
  debugPanelDataFromConfig,
  formatDebugYamlSnippet,
  getActiveDebugPresetId,
  type DebugPanelData,
} from '@editor/utils/debug-config';
import type { HaFormSchema } from '@homeassistant-extras/hass/components/ha-form/types';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { Config } from '@type/config';
import { html, type TemplateResult } from 'lit';

export interface DebugPanelParams {
  hass: HomeAssistant;
  config: Config;
  onConfigChanged: (config: Config) => void;
  onClose: () => void;
}

function getDebugFormSchema(): HaFormSchema[] {
  return [
    {
      name: 'enabled',
      label: 'Enable console debug logging',
      selector: { boolean: {} },
    },
    {
      name: 'categories',
      label: 'Categories (empty = all)',
      selector: {
        select: {
          multiple: true,
          mode: 'list' as const,
          options: DEBUG_CATEGORIES.map((value) => ({ value, label: value })),
        },
      },
    },
    {
      name: 'scope',
      label: 'Components (empty = all)',
      selector: {
        select: {
          multiple: true,
          mode: 'list' as const,
          options: DEBUG_COMPONENTS.map((value) => ({ value, label: value })),
        },
      },
    },
  ];
}

function applyPreset(config: Config, presetId: DebugPresetId): Config {
  const preset = DEBUG_PRESETS.find((entry) => entry.id === presetId);
  if (!preset) {
    return config;
  }

  const next = { ...config };
  if (preset.debug === undefined) {
    delete next.debug;
    return next;
  }

  next.debug = { ...preset.debug };
  return next;
}

/**
 * Developer debug controls (unlocked via shift+click Main or triple-click Alarm).
 */
export function renderDebugPanel(params: DebugPanelParams): TemplateResult {
  const { hass, config, onConfigChanged, onClose } = params;
  const panelData = debugPanelDataFromConfig(config);
  const yamlSnippet = formatDebugYamlSnippet(config.debug);
  const activePresetId = getActiveDebugPresetId(config);

  const onPanelValueChanged = (ev: CustomEvent) => {
    const value = ev.detail.value as DebugPanelData;
    onConfigChanged(configWithDebugPanelData(config, value));
  };

  const onPresetClick = (presetId: DebugPresetId) => {
    onConfigChanged(applyPreset(config, presetId));
  };

  const onCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlSnippet);
    } catch {
      // Clipboard may be unavailable outside a secure context
    }
  };

  return html`
    <ha-expansion-panel outlined expanded class="debug-panel">
      <div slot="header" class="debug-panel-header">
        <ha-icon icon="mdi:bug"></ha-icon>
        <span>Debug logging</span>
        <ha-icon-button
          .label=${'Hide debug menu'}
          @click=${(ev: Event) => {
            ev.stopPropagation();
            onClose();
          }}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>
      </div>
      <div class="debug-panel-body">
        <p class="debug-panel-hint">
          Logs appear in the browser devtools console.
        </p>
        <div class="debug-presets" role="group" aria-label="Debug presets">
          ${DEBUG_PRESETS.map(
            (preset) => html`
              <button
                type="button"
                class="debug-preset ${activePresetId === preset.id
                  ? 'active'
                  : ''}"
                @click=${() => onPresetClick(preset.id)}
                title=${preset.description}
                aria-pressed=${activePresetId === preset.id}
              >
                ${preset.label}
              </button>
            `,
          )}
        </div>
        <ha-form
          .hass=${hass}
          .data=${panelData}
          .schema=${getDebugFormSchema()}
          @value-changed=${onPanelValueChanged}
        ></ha-form>
        <div class="debug-yaml">
          <code>${yamlSnippet}</code>
          <button type="button" class="debug-copy-yaml" @click=${onCopyYaml}>
            Copy YAML
          </button>
        </div>
      </div>
    </ha-expansion-panel>
  `;
}
