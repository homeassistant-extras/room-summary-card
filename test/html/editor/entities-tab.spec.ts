import * as editorSchemaModule from '@/editor/editor-schema';
import * as localizeModule from '@/localize/localize';
import type { HomeAssistant } from '@hass/types';
import { renderEntitiesTab } from '@html/editor/entities-tab';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('entities-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getEntitiesStylesSchemaStub: sinon.SinonStub;
  let entityFeaturesSchemaStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;
  let onValueChanged: sinon.SinonStub;
  let onEntitiesRowChanged: sinon.SinonStub;
  let onEditDetailElement: sinon.SinonStub;

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
      entities: ['light.living_room', 'switch.fan'],
    } as any as Config;

    getEntitiesStylesSchemaStub = stub(
      editorSchemaModule,
      'getEntitiesStylesSchema',
    ).returns({
      name: 'styles',
      label: 'editor.styles.styles' as any,
      type: 'expandable',
      schema: [],
    });

    entityFeaturesSchemaStub = stub(
      editorSchemaModule,
      'entityFeaturesSchema',
    ).returns({
      name: 'features',
      label: 'editor.features.features' as any,
      selector: { select: { options: [] } },
    });

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );

    onValueChanged = stub();
    onEntitiesRowChanged = stub();
    onEditDetailElement = stub();
  });

  afterEach(() => {
    getEntitiesStylesSchemaStub.restore();
    entityFeaturesSchemaStub.restore();
    localizeStub.restore();
  });

  it('should render entities tab with correct structure', async () => {
    const result = renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room', 'switch.fan'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
    expect(el.classList.contains('entities-tab')).to.be.true;
  });

  it('should render info headers', async () => {
    const result = renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const infoHeaders = el.querySelectorAll('.info-header');

    expect(infoHeaders.length).to.equal(2);
  });

  it('should render entities-row-editor', async () => {
    const result = renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector('room-summary-entities-row-editor');

    expect(rowEditor).to.exist;
    expect((rowEditor as any).entities).to.deep.equal([
      'light.living_room',
      'switch.fan',
    ]);
  });

  it('should render ha-form elements', async () => {
    const result = renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const forms = el.querySelectorAll('ha-form');

    expect(forms.length).to.equal(2);
  });

  it('should render features list', async () => {
    const result = renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const list = el.querySelector('ul');

    expect(list).to.exist;
    expect(list?.querySelectorAll('li').length).to.equal(4);
  });

  it('should call schema functions with correct parameters', () => {
    renderEntitiesTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onEntitiesRowChanged,
      onEditDetailElement,
    });

    expect(getEntitiesStylesSchemaStub.calledOnce).to.be.true;
    expect(entityFeaturesSchemaStub.calledOnce).to.be.true;
    expect(entityFeaturesSchemaStub.firstCall.args[0]).to.equal(mockHass);
  });
});
