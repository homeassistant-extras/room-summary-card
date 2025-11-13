import * as editorSchemaModule from '@editor/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { renderSensorsTab } from '@html/editor/sensors-tab';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('sensors-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getSensorsSchemaRestStub: sinon.SinonStub;
  let sensorsFeaturesSchemaStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;
  let onValueChanged: sinon.SinonStub;
  let onSensorsRowChanged: sinon.SinonStub;
  let onEditDetailElement: sinon.SinonStub;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
      localize: (key: string) => {
        // Return null for specific key to test fallback
        if (key === 'editor.sensor.individual_sensor_entities') {
          return null as any;
        }
        return key;
      },
    } as any as HomeAssistant;

    mockConfig = {
      area: 'living_room',
      sensors: ['sensor.temperature', 'sensor.humidity'],
    } as any as Config;

    getSensorsSchemaRestStub = stub(
      editorSchemaModule,
      'getSensorsSchemaRest',
    ).returns([
      {
        name: 'sensor_classes',
        label: 'editor.sensor.sensor_classes' as any,
        selector: { select: { options: [] } },
      },
    ]);

    sensorsFeaturesSchemaStub = stub(
      editorSchemaModule,
      'sensorsFeaturesSchema',
    ).returns({
      name: 'features',
      label: 'editor.features.features' as any,
      selector: { select: { options: [] } },
    });

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );

    onValueChanged = stub();
    onSensorsRowChanged = stub();
    onEditDetailElement = stub();
  });

  afterEach(() => {
    getSensorsSchemaRestStub.restore();
    sensorsFeaturesSchemaStub.restore();
    localizeStub.restore();
  });

  it('should render sensors tab with correct structure', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature', 'humidity'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
    expect(el.classList.contains('entities-tab')).to.be.true;
  });

  it('should render info headers', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const infoHeaders = el.querySelectorAll('.info-header');

    expect(infoHeaders.length).to.equal(2);
  });

  it('should render entities-row-editor', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector('room-summary-entities-row-editor');

    expect(rowEditor).to.exist;
    expect((rowEditor as any).entities).to.deep.equal([
      'sensor.temperature',
      'sensor.humidity',
    ]);
  });

  it('should render ha-form elements', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const forms = el.querySelectorAll('ha-form');

    expect(forms.length).to.equal(2);
  });

  it('should render features list', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const list = el.querySelector('ul');

    expect(list).to.exist;
    expect(list?.querySelectorAll('li').length).to.equal(3);
  });

  it('should call schema functions with correct parameters', () => {
    renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature', 'humidity'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    expect(getSensorsSchemaRestStub.calledOnce).to.be.true;
    expect(getSensorsSchemaRestStub.firstCall.args[0]).to.equal(mockHass);
    expect(getSensorsSchemaRestStub.firstCall.args[1]).to.deep.equal([
      'temperature',
      'humidity',
    ]);

    expect(sensorsFeaturesSchemaStub.calledOnce).to.be.true;
    expect(sensorsFeaturesSchemaStub.firstCall.args[0]).to.equal(mockHass);
  });

  it('should call computeLabel function on both ha-form elements', async () => {
    const result = renderSensorsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['sensor.temperature'],
      sensorClasses: ['temperature'],
      onValueChanged,
      onSensorsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const forms = el.querySelectorAll('ha-form');

    expect(forms.length).to.equal(2);

    // Test computeLabel on first form
    const computeLabelFn1 = (forms[0] as any).computeLabel;
    expect(computeLabelFn1).to.be.a('function');
    const label1 = computeLabelFn1({
      name: 'sensor_classes',
      label: 'editor.sensor.sensor_classes' as any,
    });
    expect(label1).to.be.a('string');

    // Test computeLabel on second form (lines 59, 74)
    const computeLabelFn2 = (forms[1] as any).computeLabel;
    expect(computeLabelFn2).to.be.a('function');
    const label2 = computeLabelFn2({
      name: 'features',
      label: 'editor.features.features' as any,
    });
    expect(label2).to.be.a('string');
  });
});
