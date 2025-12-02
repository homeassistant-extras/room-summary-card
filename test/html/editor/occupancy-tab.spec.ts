import * as editorSchemaModule from '@editor/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { renderOccupancyTab } from '@html/editor/occupancy-tab';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('occupancy-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getOccupancySchemaStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;
  let onValueChanged: sinon.SinonStub;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
      localize: (key: string) => key,
    } as any as HomeAssistant;

    mockConfig = {
      area: 'living_room',
      occupancy: {
        entities: ['binary_sensor.occupancy'],
      },
    } as any as Config;

    getOccupancySchemaStub = stub(
      editorSchemaModule,
      'getOccupancySchema',
    ).returns([
      {
        name: 'occupancy',
        label: 'editor.alarm.occupancy_detection' as any,
        type: 'expandable',
        icon: 'mdi:motion-sensor',
        schema: [
          {
            name: 'entities',
            label: 'editor.alarm.motion_occupancy_presence_sensors' as any,
            selector: { entity: { multiple: true } },
          },
        ],
      },
      {
        name: 'smoke',
        label: 'editor.alarm.smoke_detection' as any,
        type: 'expandable',
        icon: 'mdi:smoke-detector',
        schema: [
          {
            name: 'entities',
            label: 'editor.alarm.smoke_detectors' as any,
            selector: { entity: { multiple: true } },
          },
        ],
      },
    ]);

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );

    onValueChanged = stub();
  });

  afterEach(() => {
    getOccupancySchemaStub.restore();
    localizeStub.restore();
  });

  it('should render occupancy tab with correct structure', async () => {
    const result = renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy'],
      onValueChanged,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
  });

  it('should render info header', async () => {
    const result = renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy'],
      onValueChanged,
    });

    // Wrap in a container div since template has multiple root elements
    const el = await fixture(html`<div>${result}</div>`);
    const infoHeader = el.querySelector('.info-header');

    expect(infoHeader).to.exist;
  });

  it('should render ha-form element', async () => {
    const result = renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy'],
      onValueChanged,
    });

    // Wrap in a container div since template has multiple root elements
    const el = await fixture(html`<div>${result}</div>`);
    const form = el.querySelector('ha-form');

    expect(form).to.exist;
    expect((form as any).hass).to.equal(mockHass);
    expect((form as any).data).to.equal(mockConfig);
    expect((form as any).computeLabel).to.be.a('function');

    const computeLabelFn = (form as any).computeLabel;
    const testSchema = {
      name: 'occupancy',
      label: 'editor.alarm.occupancy_detection' as any,
      type: 'expandable',
      schema: [] as any,
    };
    const label = computeLabelFn(testSchema);
    expect(label).to.be.a('string');
  });

  it('should call getOccupancySchema with correct parameters', () => {
    renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy', 'binary_sensor.motion'],
      onValueChanged,
    });

    expect(getOccupancySchemaStub.calledOnce).to.be.true;
    expect(getOccupancySchemaStub.firstCall.args[0]).to.equal(mockHass);
    expect(getOccupancySchemaStub.firstCall.args[1]).to.deep.equal([
      'binary_sensor.occupancy',
      'binary_sensor.motion',
    ]);
  });

  it('should localize info text', () => {
    renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy'],
      onValueChanged,
    });

    expect(localizeStub.called).to.be.true;
    expect(localizeStub.firstCall.args[1]).to.equal('editor.alarm.alarm_info');
  });

  it('should render thresholds-row-editor components', async () => {
    const result = renderOccupancyTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['binary_sensor.occupancy', 'sensor.temperature'],
      onValueChanged,
    });

    const el = await fixture(html`<div>${result}</div>`);
    const thresholdsEditors = el.querySelectorAll(
      'room-summary-thresholds-row-editor',
    );

    expect(thresholdsEditors.length).to.equal(2);
  });

  it('should render temperature thresholds editor with correct props', async () => {
    const configWithThresholds: Config = {
      ...mockConfig,
      thresholds: {
        temperature: [{ value: 75, operator: 'gt' }],
      },
    };

    const result = renderOccupancyTab({
      hass: mockHass,
      config: configWithThresholds,
      entities: ['sensor.temperature'],
      onValueChanged,
    });

    const el = await fixture(html`<div>${result}</div>`);
    const thresholdsEditors = el.querySelectorAll(
      'room-summary-thresholds-row-editor',
    );

    // Temperature editor is the first one
    const temperatureEditor = thresholdsEditors[0];

    expect(temperatureEditor).to.exist;
    expect((temperatureEditor as any).thresholds).to.deep.equal([
      { value: 75, operator: 'gt' },
    ]);
    expect((temperatureEditor as any).thresholdType).to.equal('temperature');
  });

  it('should render humidity thresholds editor with correct props', async () => {
    const configWithThresholds: Config = {
      ...mockConfig,
      thresholds: {
        humidity: [{ value: 60, operator: 'gt' }],
      },
    };

    const result = renderOccupancyTab({
      hass: mockHass,
      config: configWithThresholds,
      entities: ['sensor.humidity'],
      onValueChanged,
    });

    const el = await fixture(html`<div>${result}</div>`);
    const thresholdsEditors = el.querySelectorAll(
      'room-summary-thresholds-row-editor',
    );

    // Humidity editor is the second one
    const humidityEditor = thresholdsEditors[1];

    expect(humidityEditor).to.exist;
    expect((humidityEditor as any).thresholds).to.deep.equal([
      { value: 60, operator: 'gt' },
    ]);
    expect((humidityEditor as any).thresholdType).to.equal('humidity');
  });

  it('should render mold threshold form', async () => {
    const configWithMold: Config = {
      ...mockConfig,
      thresholds: {
        mold: 70,
      },
    };

    const result = renderOccupancyTab({
      hass: mockHass,
      config: configWithMold,
      entities: [],
      onValueChanged,
    });

    const el = await fixture(html`<div>${result}</div>`);
    const forms = el.querySelectorAll('ha-form');
    // Should have one form for occupancy/smoke and one for mold
    expect(forms.length).to.be.greaterThan(1);

    // Find the mold form
    const moldForm = Array.from(forms).find(
      (form) => (form as any).data?.mold !== undefined,
    );
    expect(moldForm).to.exist;
    expect((moldForm as any).data.mold).to.equal(70);
  });
});
