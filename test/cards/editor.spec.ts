import type { SubElementEditorConfig } from '@cards/components/editor/sub-element-editor';
import { RoomSummaryCardEditor } from '@cards/editor';
import * as editorSchemaModule from '@editor/editor-schema';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { Config } from '@type/config';
import type { EntityConfig } from '@type/config/entity';
import { expect } from 'chai';
import { CSSResult, nothing } from 'lit';
import { stub } from 'sinon';

describe('editor.ts', () => {
  let card: RoomSummaryCardEditor;
  let hass: HomeAssistant;
  let dispatchStub: sinon.SinonStub;
  let fireEventStub: sinon.SinonStub;
  let getMainSchemaStub: sinon.SinonStub;
  let getSensorsSchemaStub: sinon.SinonStub;
  let getOccupancySchemaStub: sinon.SinonStub;
  let areaEntitiesStub: sinon.SinonStub;
  let deviceClassesStub: sinon.SinonStub;
  let mockSchema: any[];
  let mockTaskValue: { sensorClasses: string[]; entities: string[] };

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

    mockTaskValue = {
      sensorClasses: ['temperature', 'humidity'],
      entities: ['light.living_room', 'switch.fan'],
    };

    // Create mock HomeAssistant instance
    hass = {
      states: {},
      areas: {},
      entities: {},
      devices: {},
      localize: (key: string) => key,
    } as HomeAssistant;

    // Create component instance
    card = new RoomSummaryCardEditor();

    // Stub the dispatch event method
    dispatchStub = stub(card, 'dispatchEvent');
    // Stub fireEvent module - make it call dispatchEvent on the target
    fireEventStub = stub(fireEventModule, 'fireEvent').callsFake(
      (target: any, type: string, detail?: any) => {
        if (!target) {
          // If target is null/undefined, just return a mock event
          // This can happen when _goBack() is called
          return new CustomEvent(type, {
            detail,
            bubbles: true,
            composed: true,
          });
        }
        const event = new CustomEvent(type, {
          detail,
          bubbles: true,
          composed: true,
        });
        return target.dispatchEvent(event);
      },
    );

    // Stub schema functions
    getMainSchemaStub = stub(editorSchemaModule, 'getMainSchema');
    getMainSchemaStub.returns(mockSchema);

    getSensorsSchemaStub = stub(editorSchemaModule, 'getSensorsSchema');
    getSensorsSchemaStub.returns(mockSchema);

    getOccupancySchemaStub = stub(editorSchemaModule, 'getOccupancySchema');
    getOccupancySchemaStub.returns(mockSchema);

    // Stub task helper functions
    areaEntitiesStub = stub(editorSchemaModule, 'areaEntities');
    areaEntitiesStub.returns(mockTaskValue.entities);

    deviceClassesStub = stub(editorSchemaModule, 'deviceClasses');
    deviceClassesStub.resolves(mockTaskValue.sensorClasses);

    // Set hass and config
    card.hass = hass;
    card.setConfig({ area: 'living_room' });
  });

  afterEach(() => {
    dispatchStub.restore();
    fireEventStub.restore();
    getMainSchemaStub.restore();
    getSensorsSchemaStub.restore();
    getOccupancySchemaStub.restore();
    areaEntitiesStub.restore();
    deviceClassesStub.restore();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(card).to.be.instanceOf(RoomSummaryCardEditor);
    });

    it('should have default properties', () => {
      expect(card.hass).to.exist;
      expect(card['_config']).to.deep.equal({
        area: 'living_room',
        occupancy: {
          entities: [],
        },
        smoke: {
          entities: [],
        },
      });
    });

    it('should return styles', () => {
      const styles = RoomSummaryCardEditor.styles;
      expect(styles).to.exist;
      expect(styles).to.be.instanceOf(CSSResult);
    });
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const testConfig: Config = {
        area: 'area_1',
        features: ['hide_climate_label'],
      };

      card.setConfig(testConfig);
      expect(card['_config']).to.deep.equal({
        ...testConfig,
        occupancy: {
          entities: [],
        },
        smoke: {
          entities: [],
        },
      });
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

    it('should render sub-element editor when active', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const result = card.render();
      expect(result).to.not.equal(nothing);
      // Verify it's a TemplateResult (not nothing)
      expect(result).to.not.equal(nothing);
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

    it('should delete sensor_layout when set to default', () => {
      const detail = {
        value: {
          area: 'area_1',
          sensor_layout: 'default',
        },
      };

      const event = new CustomEvent('value-changed', { detail });
      card['_valueChanged'](event);

      expect(dispatchStub.calledOnce).to.be.true;
      const config = dispatchStub.firstCall.args[0].detail.config;
      expect(config.sensor_layout).to.be.undefined;
    });
  });

  describe('_entitiesRowChanged', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
        entities: ['light.test'],
        lights: ['light.lamp'],
      });
    });

    it('should update entities array when value is array', () => {
      const mockTarget = {
        field: 'entities' as const,
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.test', 'switch.fan'] },
      });
      Object.defineProperty(event, 'target', { value: mockTarget });

      card['_entitiesRowChanged'](event);

      expect(card['_config'].entities).to.deep.equal([
        'light.test',
        'switch.fan',
      ]);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update lights array when value is array', () => {
      const mockTarget = {
        field: 'lights' as const,
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.lamp', 'light.ceiling'] },
      });
      Object.defineProperty(event, 'target', { value: mockTarget });

      card['_entitiesRowChanged'](event);

      expect(card['_config'].lights).to.deep.equal([
        'light.lamp',
        'light.ceiling',
      ]);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should ignore non-array values', () => {
      const initialEntities = card['_config'].entities;
      const mockTarget = {
        field: 'entities' as const,
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.test' }, // string instead of array
      });
      Object.defineProperty(event, 'target', { value: mockTarget });

      card['_entitiesRowChanged'](event);

      expect(card['_config'].entities).to.deep.equal(initialEntities);
      expect(dispatchStub.called).to.be.false;
    });

    it('should fire config-changed event with updated config', () => {
      const mockTarget = {
        field: 'entities' as const,
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.new', 'switch.new'] },
      });
      Object.defineProperty(event, 'target', { value: mockTarget });

      card['_entitiesRowChanged'](event);

      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(
        dispatchStub.firstCall.args[0].detail.config.entities,
      ).to.deep.equal(['light.new', 'switch.new']);
    });

    it('should update empty arrays and remove them after cleaning', () => {
      const mockTarget = {
        field: 'entities' as const,
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: [] },
      });
      Object.defineProperty(event, 'target', { value: mockTarget });

      card['_entitiesRowChanged'](event);

      // Empty arrays are removed by cleanEmptyArrays
      expect(card['_config'].entities).to.be.undefined;
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('_editDetailElement', () => {
    it('should set sub-element editor config', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        isMainEntity: true,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };

      const event = new CustomEvent('edit-detail-element', {
        detail: { subElementConfig },
      });

      card['_editDetailElement'](event as any);

      expect(card['_subElementEditorConfig']).to.deep.equal(subElementConfig);
    });

    it('should set type to sensor when on sensors tab', () => {
      card['_currentTab'] = 3; // Sensors tab
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: 'sensor.temperature',
      };

      const event = new CustomEvent('edit-detail-element', {
        detail: { subElementConfig },
      });

      card['_editDetailElement'](event as any);

      expect(card['_subElementEditorConfig']?.type).to.equal('sensor');
    });

    it('should not change type when not on sensors tab', () => {
      card['_currentTab'] = 0; // Main tab
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };

      const event = new CustomEvent('edit-detail-element', {
        detail: { subElementConfig },
      });

      card['_editDetailElement'](event as any);

      expect(card['_subElementEditorConfig']?.type).to.equal('entity');
    });

    it('should not change type when on sensors tab but field is not entities', () => {
      card['_currentTab'] = 3; // Sensors tab
      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 0,
        type: 'entity',
        elementConfig: 'light.test',
      };

      const event = new CustomEvent('edit-detail-element', {
        detail: { subElementConfig },
      });

      card['_editDetailElement'](event as any);

      expect(card['_subElementEditorConfig']?.type).to.equal('entity');
    });

    it('should create a copy of the config object', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        isMainEntity: true,
        elementConfig: { entity_id: 'light.test' },
      };

      const event = new CustomEvent('edit-detail-element', {
        detail: { subElementConfig },
      });

      card['_editDetailElement'](event as any);

      // Verify it's a different object reference
      expect(card['_subElementEditorConfig']).to.not.equal(subElementConfig);
      expect(card['_subElementEditorConfig']).to.deep.equal(subElementConfig);
    });
  });

  describe('_entityRowChanged', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
        entity: 'light.test',
      });
    });

    it('should update entity field when value is array with one element', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.new'] },
      });

      card['_entityRowChanged'](event);

      expect(card['_config'].entity).to.equal('light.new');
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should set entity to undefined when array is empty', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: [] },
      });

      card['_entityRowChanged'](event);

      expect(card['_config'].entity).to.be.undefined;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should take first element when array has multiple elements', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.first', 'light.second'] },
      });

      card['_entityRowChanged'](event);

      expect(card['_config'].entity).to.equal('light.first');
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should ignore non-array values', () => {
      const initialEntity = card['_config'].entity;
      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.test' }, // string instead of array
      });

      card['_entityRowChanged'](event);

      expect(card['_config'].entity).to.equal(initialEntity);
      expect(dispatchStub.called).to.be.false;
    });

    it('should fire config-changed event with updated config', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: ['light.new'] },
      });

      card['_entityRowChanged'](event);

      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(dispatchStub.firstCall.args[0].detail.config.entity).to.equal(
        'light.new',
      );
    });
  });

  describe('_sensorsRowChanged', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
        sensors: ['sensor.temperature'],
      });
    });

    it('should update sensors array when value is array', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: ['sensor.temperature', 'sensor.humidity'] },
      });

      card['_sensorsRowChanged'](event);

      expect(card['_config'].sensors).to.deep.equal([
        'sensor.temperature',
        'sensor.humidity',
      ]);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update sensors array to empty array', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: [] },
      });

      card['_sensorsRowChanged'](event);

      expect(card['_config'].sensors).to.deep.equal([]);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should ignore non-array values', () => {
      const initialSensors = card['_config'].sensors;
      const event = new CustomEvent('value-changed', {
        detail: { value: 'sensor.temperature' }, // string instead of array
      });

      card['_sensorsRowChanged'](event);

      expect(card['_config'].sensors).to.deep.equal(initialSensors);
      expect(dispatchStub.called).to.be.false;
    });

    it('should fire config-changed event with updated config', () => {
      const event = new CustomEvent('value-changed', {
        detail: { value: ['sensor.temperature', 'sensor.humidity'] },
      });

      card['_sensorsRowChanged'](event);

      expect(dispatchStub.calledOnce).to.be.true;
      expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
      expect(
        dispatchStub.firstCall.args[0].detail.config.sensors,
      ).to.deep.equal(['sensor.temperature', 'sensor.humidity']);
    });

    it('should handle sensors with EntityConfig objects', () => {
      const sensorConfig: EntityConfig = {
        entity_id: 'sensor.temperature',
        label: 'Temperature',
      };
      const event = new CustomEvent('value-changed', {
        detail: { value: [sensorConfig] },
      });

      card['_sensorsRowChanged'](event);

      expect(card['_config'].sensors).to.deep.equal([sensorConfig]);
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('_handleSubElementChanged', () => {
    beforeEach(() => {
      card.setConfig({
        area: 'living_room',
        entities: ['light.test'],
        lights: ['light.lamp'],
      });
    });

    it('should update entity config in entities array', () => {
      card['_currentTab'] = 1; // Set to Entities tab (not Main tab)
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const newConfig: EntityConfig = {
        entity_id: 'light.test',
        label: 'Test Light',
        icon: 'mdi:bulb',
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].entities?.[0]).to.deep.equal(newConfig);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update light entity_id in lights array', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 0,
        type: 'entity',
        elementConfig: 'light.lamp',
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const event = new CustomEvent('config-changed', {
        detail: { config: 'light.new' },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].lights?.[0]).to.equal('light.new');
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should extract entity_id from EntityConfig for lights', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 0,
        type: 'entity',
        elementConfig: 'light.lamp',
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const event = new CustomEvent('config-changed', {
        detail: {
          config: { entity_id: 'light.new' } as EntityConfig,
        },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].lights?.[0]).to.equal('light.new');
    });

    it('should remove light when value is falsy', () => {
      card.setConfig({
        area: 'living_room',
        lights: ['light.lamp', 'light.ceiling'],
      });
      const subElementConfig: SubElementEditorConfig = {
        field: 'lights',
        index: 0,
        type: 'entity',
        elementConfig: 'light.lamp',
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const event = new CustomEvent('config-changed', {
        detail: { config: null },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].lights).to.deep.equal(['light.ceiling']);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update sensor config in sensors array', () => {
      card['_currentTab'] = 3; // Set to Sensors tab
      card.setConfig({
        area: 'living_room',
        sensors: ['sensor.temperature'],
      });
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'sensor',
        elementConfig: 'sensor.temperature',
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const newConfig: EntityConfig = {
        entity_id: 'sensor.temperature',
        label: 'Temperature',
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].sensors?.[0]).to.deep.equal(newConfig);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should remove sensor when value is falsy', () => {
      card['_currentTab'] = 3; // Set to Sensors tab
      card.setConfig({
        area: 'living_room',
        sensors: ['sensor.temperature', 'sensor.humidity'],
      });
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'sensor',
        elementConfig: 'sensor.temperature',
      };
      card['_subElementEditorConfig'] = subElementConfig;

      const event = new CustomEvent('config-changed', {
        detail: { config: null },
      });

      card['_handleSubElementChanged'](event);

      expect(card['_config'].sensors).to.deep.equal(['sensor.humidity']);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should return early when config is missing', () => {
      card['_config'] = undefined as any;
      card['_subElementEditorConfig'] = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: { entity_id: 'light.new' } },
      });

      card['_handleSubElementChanged'](event);

      expect(dispatchStub.called).to.be.false;
    });

    it('should return early when hass is missing', () => {
      card.hass = undefined as any;
      card['_subElementEditorConfig'] = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: { entity_id: 'light.new' } },
      });

      card['_handleSubElementChanged'](event);

      expect(dispatchStub.called).to.be.false;
    });

    it('should return early when subElementEditorConfig is missing', () => {
      card['_subElementEditorConfig'] = undefined;

      const event = new CustomEvent('config-changed', {
        detail: { config: { entity_id: 'light.new' } },
      });

      card['_handleSubElementChanged'](event);

      expect(dispatchStub.called).to.be.false;
    });
  });

  describe('_goBack', () => {
    it('should clear sub-element editor config', () => {
      const subElementConfig: SubElementEditorConfig = {
        field: 'entities',
        index: 0,
        type: 'entity',
        elementConfig: { entity_id: 'light.test' },
      };
      card['_subElementEditorConfig'] = subElementConfig;

      card['_goBack']();

      expect(card['_subElementEditorConfig']).to.be.undefined;
    });
  });
});
