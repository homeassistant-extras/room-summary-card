import { getOccupancySchema } from '@editor/editor-schema';
import { computeLabel } from '@editor/utils/compute-label';
import type { HaFormSchema } from '@hass/components/ha-form/types';
import type { HomeAssistant } from '@hass/types';
import { localize } from '@localize/localize';
import type { Config, ThresholdEntry } from '@type/config';
import { html, nothing, type TemplateResult } from 'lit';

export interface OccupancyTabParams {
  hass: HomeAssistant;
  config: Config;
  entities: string[];
  onValueChanged: (ev: CustomEvent) => void;
}

/**
 * Renders the Alarm tab content for the editor (includes occupancy, smoke, and thresholds)
 * @param params - Parameters for rendering the alarm tab
 * @returns TemplateResult with the alarm tab HTML
 */
export function renderOccupancyTab(params: OccupancyTabParams): TemplateResult {
  const { hass, config, entities, onValueChanged } = params;

  const schema = getOccupancySchema(hass, entities);
  const infoText = 'editor.alarm.alarm_info';

  const handleTemperatureThresholdsChanged = (ev: CustomEvent) => {
    const thresholds = ev.detail.value as ThresholdEntry[];
    const newConfig: Config = {
      ...config,
      thresholds: {
        ...config.thresholds,
        temperature: thresholds.length > 0 ? thresholds : undefined,
      },
    };
    // Remove thresholds object if both temperature and humidity are empty
    if (
      !newConfig.thresholds?.temperature &&
      !newConfig.thresholds?.humidity &&
      !newConfig.thresholds?.mold
    ) {
      delete newConfig.thresholds;
    }
    onValueChanged(
      new CustomEvent('value-changed', {
        detail: { value: newConfig },
      }),
    );
  };

  const handleHumidityThresholdsChanged = (ev: CustomEvent) => {
    const thresholds = ev.detail.value as ThresholdEntry[];
    const newConfig: Config = {
      ...config,
      thresholds: {
        ...config.thresholds,
        humidity: thresholds.length > 0 ? thresholds : undefined,
      },
    };
    // Remove thresholds object if both temperature and humidity are empty
    if (
      !newConfig.thresholds?.temperature &&
      !newConfig.thresholds?.humidity &&
      !newConfig.thresholds?.mold
    ) {
      delete newConfig.thresholds;
    }
    onValueChanged(
      new CustomEvent('value-changed', {
        detail: { value: newConfig },
      }),
    );
  };

  const handleMoldThresholdChanged = (ev: CustomEvent) => {
    const moldValue = ev.detail.value?.mold;
    const newConfig: Config = {
      ...config,
      thresholds: {
        ...config.thresholds,
        ...(moldValue !== undefined && moldValue !== null
          ? { mold: moldValue }
          : {}),
      },
    };
    // Remove thresholds object if all fields are empty
    if (
      !newConfig.thresholds?.temperature &&
      !newConfig.thresholds?.humidity &&
      !newConfig.thresholds?.mold
    ) {
      delete newConfig.thresholds;
    } else if (!newConfig.thresholds?.mold) {
      delete newConfig.thresholds.mold;
    }
    onValueChanged(
      new CustomEvent('value-changed', {
        detail: { value: newConfig },
      }),
    );
  };

  return html`
    ${infoText
      ? html` <div class="info-header">${localize(hass, infoText)}</div> `
      : nothing}
    <ha-form
      .hass=${hass}
      .data=${config}
      .schema=${schema}
      .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
      @value-changed=${onValueChanged}
    ></ha-form>
    <ha-expansion-panel outlined>
      <div slot="header" class="thresholds-header">
        <ha-icon icon="mdi:thermometer-alert"></ha-icon>
        <span class="thresholds-title"
          >${localize(hass, 'editor.threshold.thresholds')}</span
        >
      </div>
      <div class="thresholds-section">
        <room-summary-thresholds-row-editor
          .hass=${hass}
          .thresholds=${config.thresholds?.temperature || []}
          .thresholdType=${'temperature'}
          .availableEntities=${entities}
          label=${hass.localize('editor.threshold.temperature_thresholds')}
          @threshold-entries-value-changed=${handleTemperatureThresholdsChanged}
        ></room-summary-thresholds-row-editor>
        <room-summary-thresholds-row-editor
          .hass=${hass}
          .thresholds=${config.thresholds?.humidity || []}
          .thresholdType=${'humidity'}
          .availableEntities=${entities}
          label=${hass.localize('editor.threshold.humidity_thresholds')}
          @threshold-entries-value-changed=${handleHumidityThresholdsChanged}
        ></room-summary-thresholds-row-editor>
        <ha-form
          .hass=${hass}
          .data=${{ mold: config.thresholds?.mold }}
          .schema=${[
            {
              name: 'mold',
              label: 'editor.threshold.mold_threshold',
              required: false,
              selector: {
                number: {
                  mode: 'slider' as const,
                  unit_of_measurement: '%',
                  min: 0,
                  max: 100,
                },
              },
            },
          ]}
          .computeLabel=${(schema: HaFormSchema) => computeLabel(hass, schema)}
          @value-changed=${handleMoldThresholdChanged}
        ></ha-form>
      </div>
    </ha-expansion-panel>
  `;
}
