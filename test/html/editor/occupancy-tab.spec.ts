import * as editorSchemaModule from '@/editor/editor-schema';
import * as localizeModule from '@/localize/localize';
import type { HomeAssistant } from '@hass/types';
import { renderOccupancyTab } from '@html/editor/occupancy-tab';
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
        label: 'editor.occupancy.occupancy_presence_detection' as any,
        type: 'expandable',
        schema: [
          {
            name: 'entities',
            label: 'editor.occupancy.motion_occupancy_presence_sensors' as any,
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
      label: 'editor.occupancy.occupancy_presence_detection' as any,
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
    expect(localizeStub.firstCall.args[1]).to.equal(
      'editor.occupancy.occupancy_info',
    );
  });
});
