import * as editorSchemaModule from '@/editor/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { renderMainTab } from '@html/editor/main-tab';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('main-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getAreaSchemaStub: sinon.SinonStub;
  let getMainSchemaRestStub: sinon.SinonStub;
  let onValueChanged: sinon.SinonStub;
  let onEntityRowChanged: sinon.SinonStub;
  let onEditDetailElement: sinon.SinonStub;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
      localize: (key: string) => {
        // Return null for specific key to test fallback
        if (key === 'editor.area.room_entity') {
          return null as any;
        }
        return key;
      },
    } as any as HomeAssistant;

    mockConfig = {
      area: 'living_room',
      entity: 'light.living_room',
    } as any as Config;

    getAreaSchemaStub = stub(editorSchemaModule, 'getAreaSchema').returns({
      name: 'area',
      label: 'editor.area.area' as any,
      required: true,
      selector: { area: {} },
    });

    getMainSchemaRestStub = stub(
      editorSchemaModule,
      'getMainSchemaRest',
    ).returns([
      {
        name: 'area_name',
        label: 'editor.area.area_name' as any,
        selector: { text: {} },
      },
    ]);

    onValueChanged = stub();
    onEntityRowChanged = stub();
    onEditDetailElement = stub();
  });

  afterEach(() => {
    getAreaSchemaStub.restore();
    getMainSchemaRestStub.restore();
  });

  it('should render main tab with correct structure', async () => {
    const result = renderMainTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room', 'switch.fan'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
    expect(el.classList.contains('entities-tab')).to.be.true;
  });

  it('should render ha-form elements', async () => {
    const result = renderMainTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const forms = el.querySelectorAll('ha-form');

    expect(forms.length).to.equal(2);
  });

  it('should render entities-row-editor', async () => {
    const result = renderMainTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector('room-summary-entities-row-editor');

    expect(rowEditor).to.exist;
    expect((rowEditor as any).single).to.be.true;
    expect((rowEditor as any).entities).to.deep.equal(['light.living_room']);
  });

  it('should handle config without entity', async () => {
    const configWithoutEntity = { ...mockConfig, entity: undefined };
    const result = renderMainTab({
      hass: mockHass,
      config: configWithoutEntity,
      entities: ['light.living_room'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector('room-summary-entities-row-editor');

    expect(rowEditor).to.exist;
    expect((rowEditor as any).entities).to.deep.equal([]);
  });

  it('should call getAreaSchema and getMainSchemaRest', () => {
    renderMainTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    expect(getAreaSchemaStub.calledOnce).to.be.true;
    expect(getMainSchemaRestStub.calledOnce).to.be.true;
    expect(getMainSchemaRestStub.firstCall.args[0]).to.equal(mockHass);
    expect(getMainSchemaRestStub.firstCall.args[1]).to.deep.equal([
      'light.living_room',
    ]);
  });

  it('should call computeLabel function on both ha-form elements', async () => {
    const result = renderMainTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntityRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const forms = el.querySelectorAll('ha-form');

    expect(forms.length).to.equal(2);

    // Test computeLabel on first form (line 44)
    const computeLabelFn1 = (forms[0] as any).computeLabel;
    expect(computeLabelFn1).to.be.a('function');
    const label1 = computeLabelFn1({
      name: 'area',
      label: 'editor.area.area' as any,
    });
    expect(label1).to.be.a('string');

    // Test computeLabel on second form (line 61)
    const computeLabelFn2 = (forms[1] as any).computeLabel;
    expect(computeLabelFn2).to.be.a('function');
    const label2 = computeLabelFn2({
      name: 'area_name',
      label: 'editor.area.area_name' as any,
    });
    expect(label2).to.be.a('string');
  });
});
