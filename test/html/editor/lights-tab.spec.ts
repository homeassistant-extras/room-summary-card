import * as editorSchemaModule from '@editor/editor-schema';
import type { HomeAssistant } from '@hass/types';
import { renderLightsTab } from '@html/editor/lights-tab';
import * as localizeModule from '@localize/localize';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('lights-tab.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getLightsSchemaStub: sinon.SinonStub;
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
      lights: ['light.living_room'],
    } as any as Config;

    getLightsSchemaStub = stub(editorSchemaModule, 'getLightsSchema').returns([
      {
        name: 'lights',
        label: 'editor.background.light_entities' as any,
        selector: { entity: { multiple: true } } as any,
      },
    ]);

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => key,
    );

    onValueChanged = stub();
  });

  afterEach(() => {
    getLightsSchemaStub.restore();
    localizeStub.restore();
  });

  it('should render lights tab with correct structure', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
    });

    const el = await fixture(result as TemplateResult);

    expect(el).to.exist;
  });

  it('should render info header', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
    });

    // Wrap in a container div since template has multiple root elements
    const el = await fixture(html`<div>${result}</div>`);
    const infoHeader = el.querySelector('.info-header');

    expect(infoHeader).to.exist;
  });

  it('should render ha-form element', async () => {
    const result = renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
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
      name: 'lights',
      label: 'editor.background.light_entities' as any,
      selector: { entity: { multiple: true } } as any,
    };
    const label = computeLabelFn(testSchema);
    expect(label).to.be.a('string');
  });

  it('should call getLightsSchema with correct parameters', () => {
    renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room', 'light.bedroom'],
      onValueChanged,
    });

    expect(getLightsSchemaStub.calledOnce).to.be.true;
    expect(getLightsSchemaStub.firstCall.args[0]).to.equal(mockHass);
    expect(getLightsSchemaStub.firstCall.args[1]).to.deep.equal([
      'light.living_room',
      'light.bedroom',
    ]);
  });

  it('should localize info text', () => {
    renderLightsTab({
      hass: mockHass,
      config: mockConfig,
      entities: ['light.living_room'],
      onValueChanged,
    });

    expect(localizeStub.called).to.be.true;
    expect(localizeStub.firstCall.args[1]).to.equal(
      'editor.background.multi_light_background_info',
    );
  });
});
