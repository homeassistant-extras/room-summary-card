import * as editorSchemaModule from '@editor/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { renderLightsTab } from '@html/editor/lights-tab';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('lights-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let lightsFeaturesSchemaStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;
  let onValueChanged: sinon.SinonStub;
  let onLightsRowChanged: sinon.SinonStub;
  let onEditDetailElement: sinon.SinonStub;

  beforeEach(() => {
    mockHass = {
      entities: {},
      devices: {},
      areas: {},
      states: {},
      localize: (key: string) => {
        // Return null for specific key to test fallback
        if (key === 'editor.background.light_entities') {
          return null as any;
        }
        return key;
      },
    } as any as HomeAssistant;

    mockConfig = {
      area: 'living_room',
      lights: ['light.living_room'],
    } as any as Config;

    lightsFeaturesSchemaStub = stub(
      editorSchemaModule,
      'lightsFeaturesSchema',
    ).returns({
      name: 'features',
      label: 'editor.features.features' as any,
      selector: { select: { options: [] } },
    });

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );

    onValueChanged = stub();
    onLightsRowChanged = stub();
    onEditDetailElement = stub();
  });

  afterEach(() => {
    lightsFeaturesSchemaStub.restore();
    localizeStub.restore();
  });

  it('should render lights tab with correct structure', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
    expect(el.classList.contains('entities-tab')).to.be.true;
  });

  it('should render info headers', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const infoHeaders = el.querySelectorAll('.info-header');

    expect(infoHeaders.length).to.equal(2);
  });

  it('should render entities-row-editor', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector(
      'room-summary-entities-row-editor',
    ) as any;

    expect(rowEditor).to.exist;
    // Wait for component to update
    await rowEditor.updateComplete;
    expect(rowEditor.lights).to.deep.equal(['light.living_room']);
    // Check attribute since property might not be set immediately in test environment
    expect(rowEditor.getAttribute('field') || rowEditor.field).to.equal(
      'lights',
    );
    expect(rowEditor.availableEntities).to.deep.equal(['light.living_room']);
  });

  it('should render ha-form element for features', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const form = el.querySelector('ha-form');

    expect(form).to.exist;
    expect((form as any).hass).to.equal(mockHass);
    expect((form as any).data).to.equal(mockConfig);
    expect((form as any).computeLabel).to.be.a('function');

    const computeLabelFn = (form as any).computeLabel;
    const testSchema = {
      name: 'features',
      label: 'editor.features.features' as any,
    };
    const label = computeLabelFn(testSchema);
    expect(label).to.be.a('string');
  });

  it('should call schema functions with correct parameters', () => {
    renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room', 'light.bedroom'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    expect(lightsFeaturesSchemaStub.calledOnce).to.be.true;
    expect(lightsFeaturesSchemaStub.firstCall.args[0]).to.equal(mockHass);
  });

  it('should localize info text', () => {
    renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    expect(localizeStub.called).to.be.true;
    const localizeCalls = localizeStub.getCalls();
    const infoTextCall = localizeCalls.find(
      (call) =>
        call.args[1] === 'editor.background.multi_light_background_info',
    );
    expect(infoTextCall).to.exist;
  });

  it('should handle lights with object configuration', async () => {
    const configWithObject = {
      ...mockConfig,
      lights: [
        { entity_id: 'light.living_room', type: 'ambient' },
        'light.bedroom',
      ],
    } as any as Config;

    const result = renderLightsTab({
      hass: mockHass,
      config: configWithObject,
      entities: ['light.living_room', 'light.bedroom'],
      onValueChanged,
      onLightsRowChanged,
      onEditDetailElement,
    });

    const el = await fixture(result as TemplateResult);
    const rowEditor = el.querySelector('room-summary-entities-row-editor');

    expect(rowEditor).to.exist;
    expect((rowEditor as any).lights).to.deep.equal([
      { entity_id: 'light.living_room', type: 'ambient' },
      'light.bedroom',
    ]);
  });
});
