import { RoomSummaryCardEditor } from '@/cards/editor';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('editor.ts', () => {
  let card: RoomSummaryCardEditor;
  let hass: HomeAssistant;
  let dispatchStub: sinon.SinonStub;

  beforeEach(async () => {
    // Create mock HomeAssistant instance
    hass = {
      states: {},
      areas: {},
      entities: {},
      devices: {},
    } as HomeAssistant;
    card = new RoomSummaryCardEditor();
    dispatchStub = stub(card, 'dispatchEvent');

    card.hass = hass;
  });

  afterEach(() => {
    dispatchStub.restore();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(card).to.be.instanceOf(RoomSummaryCardEditor);
    });

    it('should have default properties', () => {
      expect(card.hass).to.exist;
      expect(card['_config']).to.be.undefined;
    });
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const testConfig: Config = {
        area: 'area_1',
        features: ['hide_climate_label'],
      };

      card.setConfig(testConfig);
      expect(card['_config']).to.deep.equal(testConfig);
    });
  });

  describe('render', () => {
    it('should return nothing when hass is not set', async () => {
      card.hass = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when config is not set', async () => {
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render ha-form when both hass and config are set', async () => {
      const testConfig: Config = {
        area: 'area_1',
      };
      card.setConfig(testConfig);

      const el = await fixture(card.render() as TemplateResult);
      expect(el.outerHTML).to.equal('<ha-form></ha-form>');
    });

    it('should pass correct props to ha-form', async () => {
      const testConfig: Config = {
        area: 'area_1',
        features: ['hide_climate_label'],
      };
      card.setConfig(testConfig);

      const el = await fixture(card.render() as TemplateResult);
      expect((el as any).hass).to.deep.equal(hass);
      expect((el as any).data).to.deep.equal(testConfig);
      expect((el as any).schema).to.deep.equal([
        { name: 'area', label: 'Area', required: true, selector: { area: {} } },
        {
          name: 'entity',
          label: 'Main room entity',
          required: false,
          selector: { entity: { multiple: false } },
        },
        {
          name: 'entities',
          label: 'Area side entities',
          required: false,
          selector: { entity: { multiple: true } },
        },
        {
          name: 'temperature_sensor',
          label: 'Temperature sensor',
          required: false,
          selector: {
            entity: { multiple: false, filter: { domain: 'sensor' } },
          },
        },
        {
          name: 'humidity_sensor',
          label: 'Humidity sensor',
          required: false,
          selector: {
            entity: { multiple: false, filter: { domain: 'sensor' } },
          },
        },
        {
          name: 'navigate',
          label: 'Navigate path when card tapped',
          required: false,
          selector: { text: { type: 'url' } },
        },
        {
          name: 'features',
          label: 'Features',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list',
              options: [
                {
                  label: 'Hide Climate Label',
                  value: 'hide_climate_label',
                },
                { label: 'Hide Area Stats', value: 'hide_area_stats' },
                {
                  label: 'Exclude Default Entities',
                  value: 'exclude_default_entities',
                },
                { label: 'Skip Climate Styles', value: 'skip_climate_styles' },
              ],
            },
          },
        },
      ]);
    });
  });

  describe('form behavior', () => {
    it('should compute labels correctly', async () => {
      const testConfig: Config = {
        area: 'area_1',
        features: [],
      };
      card.setConfig(testConfig);

      const el = await fixture(card.render() as TemplateResult);
      const computeLabelFn = (el as any).computeLabel;
      expect(computeLabelFn).to.be.a('function');

      // Test the compute label function
      const testSchema = { name: 'test', label: 'Test Label' };
      const result = computeLabelFn(testSchema);
      expect(result).to.equal('Test Label');
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with config when features are present', () => {
      const testConfig: Config = {
        area: 'area_1',
        features: ['hide_climate_label'],
      };
      card.setConfig(testConfig);

      // Simulate value-changed event
      const detail = {
        value: {
          area: 'area_1',
          features: ['hide_climate_label'],
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with correct data
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'area_1',
        features: ['hide_climate_label'],
      });
    });

    it('should remove features property when features array is empty', () => {
      const testConfig: Config = {
        area: 'area_1',
        features: [],
      };
      card.setConfig(testConfig);

      // Simulate value-changed event with empty features
      const detail = {
        value: {
          area: 'area_1',
          features: [],
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with features property removed
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'area_1',
      });
      expect(dispatchStub.firstCall.args[0].detail.config.features).to.be
        .undefined;
    });

    it('should handle config without features property', () => {
      const testConfig: Config = {
        area: 'area_1',
      };
      card.setConfig(testConfig);

      // Simulate value-changed event without features
      const detail = {
        value: {
          area: 'area_1',
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched correctly
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'area_1',
      });
    });
  });
});
