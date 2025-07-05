import { RoomSummaryCardEditor } from '@/cards/editor';
import * as editorSchemaModule from '@/editor/editor-schema';
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
  let getSchemaStub: sinon.SinonStub;
  let mockSchema: any[];

  beforeEach(async () => {
    // Create mock schema
    mockSchema = [
      {
        name: 'area',
        label: 'Area',
        required: true,
        selector: { area: {} },
      },
      {
        name: 'content',
        label: 'Content',
        type: 'expandable',
        schema: [],
      },
    ];

    // Create mock HomeAssistant instance
    hass = {
      states: {},
      areas: {},
      entities: {},
      devices: {},
    } as HomeAssistant;

    // Create component instance
    card = new RoomSummaryCardEditor();

    // Stub the dispatch event method
    dispatchStub = stub(card, 'dispatchEvent');

    // Stub the getSchema function
    getSchemaStub = stub(editorSchemaModule, 'getSchema');
    getSchemaStub.resolves(mockSchema);

    // Set hass and config
    card.hass = hass;
    card.setConfig({ area: 'living_room' });
  });

  afterEach(() => {
    dispatchStub.restore();
    getSchemaStub.restore();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(card).to.be.instanceOf(RoomSummaryCardEditor);
    });

    it('should have default properties', () => {
      expect(card.hass).to.exist;
      expect(card['_config']).to.deep.equal({ area: 'living_room' });
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
    it('should return nothing when hass is not set', () => {
      card.hass = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when config is not set', () => {
      card['_config'] = undefined as any;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render task with the correct states', async () => {
      // Mock the task render function to test different states
      const taskRenderStub = stub(card['_getEntitiesTask'], 'render');

      // Test render
      card.render();

      // Verify task.render was called with the correct handlers
      expect(taskRenderStub.calledOnce).to.be.true;
      const handlers = taskRenderStub.firstCall.args[0];

      // Test initial state
      // @ts-ignore
      expect(handlers.initial()).to.equal(nothing);

      // Test pending state
      // @ts-ignore
      expect(handlers.pending()).to.equal(nothing);

      // Test error state
      const error = new Error('Test error');
      // @ts-ignore
      const errorResult = handlers.error(error) as TemplateResult;
      expect(errorResult.values).to.deep.equal([error]);

      // Test complete state with schema
      const el = await fixture(
        // @ts-ignore
        handlers.complete(mockSchema) as TemplateResult,
      );
      expect(el.outerHTML).to.equal('<ha-form></ha-form>');

      // Restore stub
      taskRenderStub.restore();
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with config when features are present', () => {
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

    it('should remove empty fields from config', () => {
      // Simulate value-changed event with empty arrays
      const detail = {
        value: {
          area: 'area_1',
          entities: [],
          problem_entities: [],
          features: [],
          sensor_classes: [],
          thresholds: {},
          background: {
            options: undefined,
          },
          styles: {
            card: undefined,
            entities: undefined,
            sensors: undefined,
            stats: undefined,
            title: undefined,
          },
          occupancy: {
            entities: [],
            options: [],
          },
        } as Config,
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      // Verify event was dispatched with properties removed
      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
        area: 'area_1',
        styles: {
          card: undefined,
          entities: undefined,
          sensors: undefined,
          stats: undefined,
          title: undefined,
        },
      });
    });

    it('should handle config without features property', () => {
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
