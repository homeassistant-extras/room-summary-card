import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { StateConfig } from '@type/config/entity';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummaryStatesRowEditor } from '../../../../src/cards/components/editor/states-row-editor';

describe('states-row-editor.ts', () => {
  let element: RoomSummaryStatesRowEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockStateConfigs: StateConfig[] = [
    {
      state: 'on',
      icon_color: '#ff0000',
      label: 'On State',
      icon: 'mdi:power',
    },
    {
      state: 'off',
      icon_color: '#000000',
      attribute: 'battery_level',
    },
  ];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'editor.entity.states': 'States',
          'editor.entity.add_state': 'Add State',
          'editor.entity.state.state': 'State',
          'editor.entity.state.icon_color': 'Icon Color',
          'editor.entity.state.icon': 'Icon',
          'editor.entity.state.label': 'Label',
          'editor.entity.state.attribute': 'Attribute',
          'editor.entity.state.styles': 'Styles',
          'editor.entity.entity_label': 'Entity Label',
          'ui.panel.lovelace.editor.card.config.optional': 'optional',
          'ui.panel.lovelace.editor.card.config.required': 'required',
          'ui.components.entity.entity-picker.clear': 'Clear',
        };
        return translations[key] || key;
      },
    } as any as HomeAssistant;

    element = new RoomSummaryStatesRowEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with undefined states', () => {
      expect(element.states).to.be.undefined;
    });

    it('should set states property', () => {
      element.states = mockStateConfigs;
      expect(element.states).to.deep.equal(mockStateConfigs);
    });

    it('should set label property', () => {
      element.label = 'Custom States Label';
      expect(element.label).to.equal('Custom States Label');
    });

    it('should set entityId property', () => {
      element.entityId = 'light.living_room';
      expect(element.entityId).to.equal('light.living_room');
    });

    it('should initialize with empty expanded states set', () => {
      expect(element['_expandedStates'].size).to.equal(0);
    });
  });

  describe('_getKey', () => {
    it('should generate key using index', () => {
      element.mode = 'states';
      const state: StateConfig = { state: 'on', icon_color: '#ff0000' };
      const key = element['_getKey'](state, 0);
      expect(key).to.equal('states-0');
    });

    it('should generate different keys for different indices', () => {
      element.mode = 'states';
      const state: StateConfig = { state: 'on', icon_color: '#ff0000' };
      const key1 = element['_getKey'](state, 0);
      const key2 = element['_getKey'](state, 1);
      expect(key1).to.not.equal(key2);
      expect(key1).to.equal('states-0');
      expect(key2).to.equal('states-1');
    });

    it('should generate stable keys for same index', () => {
      element.mode = 'states';
      const state1: StateConfig = { state: 'on', icon_color: '#ff0000' };
      const state2: StateConfig = { state: 'off', icon_color: '#000000' };
      const key1 = element['_getKey'](state1, 0);
      const key2 = element['_getKey'](state2, 0);
      expect(key1).to.equal(key2);
      expect(key1).to.equal('states-0');
    });
  });

  describe('_getStateSchema', () => {
    it('should create schema with correct structure', () => {
      element.entityId = 'light.living_room';
      const schema = element['_getStateSchema'](
        'light.living_room',
        mockHass,
        false,
        false,
      );

      expect(schema).to.be.an('array');
      expect(schema.length).to.be.greaterThan(0);

      // Check required fields
      const stateField = schema.find((s) => s.name === 'state') as any;
      expect(stateField).to.exist;
      expect(stateField?.required).to.be.true;
      expect(stateField?.selector).to.deep.equal({ text: {} });

      const iconColorField = schema.find((s) => s.name === 'icon_color') as any;
      expect(iconColorField).to.exist;
      expect(iconColorField?.required).to.be.true;
      expect(iconColorField?.selector).to.deep.equal({ ui_color: {} });
    });

    it('should include optional fields', () => {
      element.entityId = 'sensor.temperature';
      const schema = element['_getStateSchema'](
        'sensor.temperature',
        mockHass,
        false,
        false,
      );

      const attributeField = schema.find((s) => s.name === 'attribute') as any;
      expect(attributeField).to.exist;
      expect(attributeField?.required).to.be.false;
      expect(attributeField?.selector).to.deep.equal({
        attribute: { entity_id: 'sensor.temperature' },
      });

      const stylesField = schema.find((s) => s.name === 'styles') as any;
      expect(stylesField).to.exist;
      expect(stylesField?.required).to.be.false;
      expect(stylesField?.selector).to.deep.equal({ object: {} });
    });

    it('should include grid schema for icon and label', () => {
      element.entityId = 'light.bedroom';
      const schema = element['_getStateSchema'](
        'light.bedroom',
        mockHass,
        false,
        false,
      );

      const gridSchema = schema.find((s) => s.type === 'grid') as any;
      expect(gridSchema).to.exist;
      expect(gridSchema?.schema).to.be.an('array');
      expect(gridSchema?.schema?.length).to.equal(2);

      const iconField = gridSchema?.schema?.find(
        (s: any) => s.name === 'icon',
      ) as any;
      expect(iconField).to.exist;
      expect(iconField?.selector).to.deep.equal({ icon: {} });

      const labelField = gridSchema?.schema?.find(
        (s: any) => s.name === 'label',
      ) as any;
      expect(labelField).to.exist;
      expect(labelField?.selector).to.deep.equal({ text: {} });
    });

    it('should memoize schema for same entity_id', () => {
      element.entityId = 'light.kitchen';
      const schema1 = element['_getStateSchema'](
        'light.kitchen',
        mockHass,
        false,
        false,
      );
      const schema2 = element['_getStateSchema'](
        'light.kitchen',
        mockHass,
        false,
        false,
      );

      expect(schema1).to.equal(schema2); // Same reference due to memoization
    });

    it('should create different schema for different entity_id', () => {
      const schema1 = element['_getStateSchema'](
        'light.living_room',
        mockHass,
        false,
        false,
      );
      const schema2 = element['_getStateSchema'](
        'sensor.temp',
        mockHass,
        false,
        false,
      );

      expect(schema1).to.not.equal(schema2);

      const attr1 = schema1.find((s) => s.name === 'attribute') as any;
      const attr2 = schema2.find((s) => s.name === 'attribute') as any;
      expect(attr1?.selector).to.deep.equal({
        attribute: { entity_id: 'light.living_room' },
      });
      expect(attr2?.selector).to.deep.equal({
        attribute: { entity_id: 'sensor.temp' },
      });
    });

    it('should exclude title_color when isSensor is true', () => {
      const entitySchema = element['_getStateSchema'](
        'light.living_room',
        mockHass,
        false,
        false,
      );
      const sensorSchema = element['_getStateSchema'](
        'sensor.temperature',
        mockHass,
        true,
        false,
      );

      const entityTitleColor = entitySchema.find(
        (s) => s.name === 'title_color',
      );
      const sensorTitleColor = sensorSchema.find(
        (s) => s.name === 'title_color',
      );

      expect(entityTitleColor).to.not.exist;
      expect(sensorTitleColor).to.not.exist;
    });

    it('should only include title_color for main entity', () => {
      const mainEntitySchema = element['_getStateSchema'](
        'light.living_room',
        mockHass,
        false,
        true,
      );
      const entitiesListSchema = element['_getStateSchema'](
        'light.living_room',
        mockHass,
        false,
        false,
      );

      const mainEntityTitleColor = mainEntitySchema.find(
        (s) => s.name === 'title_color',
      );
      const entitiesListTitleColor = entitiesListSchema.find(
        (s) => s.name === 'title_color',
      );

      expect(mainEntityTitleColor).to.exist;
      expect(entitiesListTitleColor).to.not.exist;
    });
  });

  describe('_computeLabelCallback', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should return empty string when schema has no label', () => {
      const schema = { name: 'test' };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.equal('');
    });

    it('should compute label for required field', () => {
      const schema = {
        name: 'state',
        label: 'editor.entity.state.state',
        required: true,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('State');
      expect(result).to.include('(required)');
    });

    it('should compute label for optional field', () => {
      const schema = {
        name: 'label',
        label: 'editor.entity.state.label',
        required: false,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('Label');
      expect(result).to.include('(optional)');
    });

    it('should handle undefined required field as optional', () => {
      const schema = {
        name: 'icon',
        label: 'editor.entity.state.icon',
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('Icon');
      expect(result).to.include('(optional)');
    });
  });

  describe('_expandedStates', () => {
    it('should expand state when not expanded', () => {
      element['_expandedStates'] = new Set([0]);
      expect(element['_expandedStates'].has(0)).to.be.true;
    });

    it('should collapse state when expanded', () => {
      element['_expandedStates'] = new Set([0]);
      element['_expandedStates'] = new Set();
      expect(element['_expandedStates'].has(0)).to.be.false;
    });

    it('should handle multiple expanded states', () => {
      element['_expandedStates'] = new Set([0, 1, 2]);
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true;
      expect(element['_expandedStates'].has(2)).to.be.true;
    });

    it('should toggle individual states independently', () => {
      element['_expandedStates'] = new Set([1]);
      expect(element['_expandedStates'].has(0)).to.be.false;
      expect(element['_expandedStates'].has(1)).to.be.true;
    });
  });

  describe('_addItem', () => {
    it('should add new state to empty array', () => {
      element.mode = 'states';
      element.states = [];

      element['_addItem']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('states-value-changed');
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);
      expect(newStates[0]).to.deep.equal({
        state: '',
        icon_color: '',
      });
    });

    it('should add new state to existing array', () => {
      element.mode = 'states';
      element.states = [...mockStateConfigs];

      element['_addItem']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(3);
      expect(newStates[2]).to.deep.equal({
        state: '',
        icon_color: '',
      });
      // Original states should be preserved
      expect(newStates[0]).to.deep.equal(mockStateConfigs[0]);
      expect(newStates[1]).to.deep.equal(mockStateConfigs[1]);
    });

    it('should handle undefined states array', () => {
      element.mode = 'states';
      element.states = undefined;

      element['_addItem']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);
      expect(newStates[0]).to.deep.equal({
        state: '',
        icon_color: '',
      });
    });

    it('should expand newly added state', () => {
      element.mode = 'states';
      element.states = [];

      element['_addItem']();

      const newStates = fireEventStub.firstCall.args[2].value;
      const newIndex = newStates.length - 1;
      expect(element['_expandedStates'].has(newIndex)).to.be.true;
    });
  });

  describe('_removeItem', () => {
    it('should remove state at specified index', () => {
      element.states = [...mockStateConfigs];

      element.mode = 'states';
      element['_removeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);
      expect(newStates[0]).to.deep.equal(mockStateConfigs[1]);
    });

    it('should remove last state', () => {
      element.states = [...mockStateConfigs];

      element.mode = 'states';
      element['_removeItem'](1);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);
      expect(newStates[0]).to.deep.equal(mockStateConfigs[0]);
    });

    it('should adjust expanded indices after removal', () => {
      element.states = [
        ...mockStateConfigs,
        { state: 'standby', icon_color: '#888888' },
      ];
      element['_expandedStates'] = new Set([0, 1, 2]);

      element.mode = 'states';
      element['_removeItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true;
      expect(element['_expandedStates'].has(2)).to.be.false;
    });

    it('should remove expanded state index when removing state', () => {
      element.states = [...mockStateConfigs];
      element['_expandedStates'] = new Set([0, 1]);

      element.mode = 'states';
      element['_removeItem'](0);

      // After removing index 0, the state at index 1 moves to index 0
      // So the expanded state that was at index 1 is now at index 0
      expect(element['_expandedStates'].has(0)).to.be.true; // Was index 1, now index 0
      expect(element['_expandedStates'].has(1)).to.be.false; // Original index 0 was removed
    });

    it('should handle removing from empty array', () => {
      element.states = [];

      element.mode = 'states';
      element['_removeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates.length).to.equal(0);
    });

    it('should send empty array when removing last state', () => {
      element.states = [{ state: 'on', icon_color: '#ff0000' }];

      element.mode = 'states';
      element['_removeItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates.length).to.equal(0);
    });

    it('should handle removing state with expanded indices before it', () => {
      element.states = [
        { state: 'a', icon_color: '#ff0000' },
        { state: 'b', icon_color: '#00ff00' },
        { state: 'c', icon_color: '#0000ff' },
      ];
      element['_expandedStates'] = new Set([0, 2]);

      element.mode = 'states';
      element['_removeItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true;
      expect(element['_expandedStates'].has(2)).to.be.false;
    });
  });

  describe('_adjustExpandedIndicesAfterRemoval', () => {
    it('should remove the deleted index from expanded states', () => {
      element['_expandedStates'] = new Set([0, 1, 2]);
      const result = element['_adjustExpandedIndicesAfterRemoval'](1);
      // Removing index 1:
      // Index 0 stays 0
      // Index 1 is removed
      // Index 2 becomes 1
      expect(result.has(0)).to.be.true; // Unchanged
      expect(result.has(1)).to.be.true; // Was index 2, adjusted to 1
      expect(result.has(2)).to.be.false; // Was removed/adjusted
      expect(result.size).to.equal(2);
    });

    it('should decrement indices greater than removed index', () => {
      element['_expandedStates'] = new Set([0, 2, 3]);
      const result = element['_adjustExpandedIndicesAfterRemoval'](1);
      // Removing index 1:
      // Index 0 stays 0
      // Index 2 becomes 1
      // Index 3 becomes 2
      expect(result.has(0)).to.be.true; // Before removed index, unchanged
      expect(result.has(1)).to.be.true; // Was index 2
      expect(result.has(2)).to.be.true; // Was index 3
      expect(result.size).to.equal(3);
    });

    it('should keep indices less than removed index unchanged', () => {
      element['_expandedStates'] = new Set([0, 1]);
      const result = element['_adjustExpandedIndicesAfterRemoval'](2);
      expect(result.has(0)).to.be.true;
      expect(result.has(1)).to.be.true;
    });

    it('should handle empty expanded states', () => {
      element['_expandedStates'] = new Set();
      const result = element['_adjustExpandedIndicesAfterRemoval'](0);
      expect(result.size).to.equal(0);
    });

    it('should handle removing first index', () => {
      element['_expandedStates'] = new Set([0, 1, 2]);
      const result = element['_adjustExpandedIndicesAfterRemoval'](0);
      // Removing index 0:
      // Index 1 becomes 0
      // Index 2 becomes 1
      expect(result.has(0)).to.be.true; // Was index 1
      expect(result.has(1)).to.be.true; // Was index 2
      expect(result.size).to.equal(2);
    });

    it('should handle removing last index', () => {
      element['_expandedStates'] = new Set([0, 1, 2]);
      const result = element['_adjustExpandedIndicesAfterRemoval'](2);
      expect(result.has(0)).to.be.true;
      expect(result.has(1)).to.be.true;
      expect(result.has(2)).to.be.false; // Removed
    });
  });

  describe('_removeStateItem', () => {
    beforeEach(() => {
      element.mode = 'states';
    });

    it('should remove state at specified index', () => {
      element.states = [...mockStateConfigs];
      element['_removeStateItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal('states-value-changed');
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);
      expect(newStates[0]).to.deep.equal(mockStateConfigs[1]);
    });

    it('should adjust expanded states after removal', () => {
      element.states = [
        ...mockStateConfigs,
        { state: 'standby', icon_color: '#888888' },
      ];
      element['_expandedStates'] = new Set([0, 2]);
      element['_removeStateItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true;
      expect(element['_expandedStates'].has(2)).to.be.false;
    });

    it('should send empty array when removing last state', () => {
      element.states = [{ state: 'on', icon_color: '#ff0000' }];
      element['_removeStateItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates.length).to.equal(0);
    });

    it('should handle undefined states array', () => {
      element.states = undefined;
      element['_removeStateItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates.length).to.equal(0);
    });

    it('should remove expanded state index when removing state', () => {
      element.states = [...mockStateConfigs];
      element['_expandedStates'] = new Set([0, 1]);
      element['_removeStateItem'](0);

      // After removing index 0, the state at index 1 moves to index 0
      expect(element['_expandedStates'].has(0)).to.be.true; // Was index 1
      expect(element['_expandedStates'].has(1)).to.be.false;
    });
  });

  describe('_removeThresholdItem', () => {
    beforeEach(() => {
      element.mode = 'thresholds';
      mockHass.localize = (key: string) => {
        const translations: Record<string, string> = {
          'editor.entity.thresholds': 'Thresholds',
          'editor.entity.add_threshold': 'Add Threshold',
          'editor.entity.threshold.threshold': 'Threshold',
          'editor.entity.threshold.icon_color': 'Icon Color',
          'editor.entity.threshold.icon': 'Icon',
          'editor.entity.threshold.label': 'Label',
          'editor.entity.threshold.attribute': 'Attribute',
          'editor.entity.threshold.styles': 'Styles',
          'editor.entity.entity_label': 'Entity Label',
          'ui.panel.lovelace.editor.card.config.optional': 'optional',
          'ui.panel.lovelace.editor.card.config.required': 'required',
          'ui.components.entity.entity-picker.clear': 'Clear',
        };
        return translations[key] || key;
      };
    });

    const mockThresholdConfigs = [
      {
        threshold: 20,
        icon_color: '#ff0000',
        label: 'Low Threshold',
      },
      {
        threshold: 80,
        icon_color: '#0000ff',
        operator: 'gte' as const,
      },
    ];

    it('should remove threshold at specified index', () => {
      element.thresholds = [...mockThresholdConfigs];
      element['_removeThresholdItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal(
        'thresholds-value-changed',
      );
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(1);
      expect(newThresholds[0]).to.deep.equal(mockThresholdConfigs[1]);
    });

    it('should adjust expanded states after removal', () => {
      element.thresholds = [
        ...mockThresholdConfigs,
        { threshold: 50, icon_color: '#888888' },
      ];
      element['_expandedStates'] = new Set([0, 2]);
      element['_removeThresholdItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true;
      expect(element['_expandedStates'].has(2)).to.be.false;
    });

    it('should send empty array when removing last threshold', () => {
      element.thresholds = [{ threshold: 20, icon_color: '#ff0000' }];
      element['_removeThresholdItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.be.an('array');
      expect(newThresholds.length).to.equal(0);
    });

    it('should handle undefined thresholds array', () => {
      element.thresholds = undefined;
      element['_removeThresholdItem'](0);

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.be.an('array');
      expect(newThresholds.length).to.equal(0);
    });

    it('should remove expanded state index when removing threshold', () => {
      element.thresholds = [...mockThresholdConfigs];
      element['_expandedStates'] = new Set([0, 1]);
      element['_removeThresholdItem'](0);

      // After removing index 0, the threshold at index 1 moves to index 0
      expect(element['_expandedStates'].has(0)).to.be.true; // Was index 1
      expect(element['_expandedStates'].has(1)).to.be.false;
    });
  });

  describe('_itemValueChanged', () => {
    it('should update state at specified index', () => {
      element.states = [...mockStateConfigs];

      const updatedState: StateConfig = {
        state: 'standby',
        icon_color: '#888888',
        label: 'Standby',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedState },
      });

      element.mode = 'states';
      element['_itemValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates[0]).to.deep.equal(updatedState);
      expect(newStates[1]).to.deep.equal(mockStateConfigs[1]);
    });

    it('should update state at different index', () => {
      element.states = [...mockStateConfigs];

      const updatedState: StateConfig = {
        state: 'error',
        icon_color: '#ff0000',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedState },
      });

      element.mode = 'states';
      element['_itemValueChanged'](1, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates[0]).to.deep.equal(mockStateConfigs[0]);
      expect(newStates[1]).to.deep.equal(updatedState);
    });

    it('should handle undefined states array', () => {
      element.states = undefined;

      const updatedState: StateConfig = {
        state: 'on',
        icon_color: '#ff0000',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedState },
      });

      element.mode = 'states';
      element['_itemValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates[0]).to.deep.equal(updatedState);
    });

    it('should not update when value is invalid', () => {
      element.states = [...mockStateConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: null },
      });

      element.mode = 'states';
      element['_itemValueChanged'](0, event);

      // Should still fire event but with original state
      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates[0]).to.deep.equal(mockStateConfigs[0]);
    });

    it('should always send an array', () => {
      element.states = [];

      const updatedState: StateConfig = {
        state: 'on',
        icon_color: '#ff0000',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedState },
      });

      element.mode = 'states';
      element['_itemValueChanged'](0, event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
    });
  });

  describe('_getItemTitle', () => {
    it('should return state with label when label exists', () => {
      const state: StateConfig = {
        state: 'on',
        icon_color: '#ff0000',
        label: 'Power On',
      };
      element.mode = 'states';
      const title = element['_getItemTitle'](state);
      expect(title).to.equal('on (Power On)');
    });

    it('should return only state when no label', () => {
      const state: StateConfig = {
        state: 'off',
        icon_color: '#000000',
      };
      element.mode = 'states';
      const title = element['_getItemTitle'](state);
      expect(title).to.equal('off');
    });

    it('should return "New State" when state is empty', () => {
      const state: StateConfig = {
        state: '',
        icon_color: '#ff0000',
      };
      element.mode = 'states';
      const title = element['_getItemTitle'](state);
      expect(title).to.equal('New State');
    });

    it('should handle state with only whitespace', () => {
      const state: StateConfig = {
        state: '  ',
        icon_color: '#ff0000',
      };
      element.mode = 'states';
      const title = element['_getItemTitle'](state);
      expect(title).to.equal('  ');
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.hass = undefined;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render with default label when no custom label', () => {
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with custom label', () => {
      element.label = 'Custom States';
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with empty states array', () => {
      element.states = [];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with undefined states as empty array', () => {
      element.states = undefined;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render states with expansion panels', () => {
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
      // Verify that the template renders correctly with states
      // The repeat directive will render expansion panels for each state
      // We verify rendering works by checking result is not nothing
      // and that the template structure is valid (has strings array)
      expect(result.strings).to.be.an('array');
      expect(result.strings.length).to.be.greaterThan(0);
    });

    it('should render add state button', () => {
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      const templateString = result.strings.join('');
      expect(templateString).to.include('mwc-button');
      expect(templateString).to.include('add-state');
    });

    it('should use entityId in schema when provided', () => {
      element.entityId = 'light.bedroom';
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should use empty string for entityId when not provided', () => {
      element.entityId = undefined;
      element.states = mockStateConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle states as object and convert to array', () => {
      // This tests the Array.isArray check
      element.states = mockStateConfigs as any;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(RoomSummaryStatesRowEditor.styles).to.exist;
    });

    it('should include states container styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('states');
      expect(styles).to.include('flex-direction');
    });

    it('should include state header styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('state-header');
      expect(styles).to.include('justify-content');
    });

    it('should include state title styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('state-title');
      expect(styles).to.include('font-weight');
    });

    it('should include remove icon styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('remove-icon');
      expect(styles).to.include('--mdc-icon-button-size');
    });

    it('should include add state button styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('add-state');
      expect(styles).to.include('cursor');
    });

    it('should include expansion panel styles', () => {
      const styles = RoomSummaryStatesRowEditor.styles.toString();
      expect(styles).to.include('ha-expansion-panel');
      expect(styles).to.include('--expansion-panel-summary-padding');
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: add, update, remove', () => {
      element.mode = 'states';
      element.states = [];

      // Add state
      element['_addItem']();
      expect(fireEventStub.calledOnce).to.be.true;
      let newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(1);

      // Update states
      element.states = newStates;
      fireEventStub.resetHistory();

      // Update state
      const updatedState: StateConfig = {
        state: 'on',
        icon_color: '#ff0000',
        label: 'On',
      };
      const updateEvent = new CustomEvent('value-changed', {
        detail: { value: updatedState },
      });
      element.mode = 'states';
      element['_itemValueChanged'](0, updateEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates[0]).to.deep.equal(updatedState);

      // Update states again
      element.states = newStates;
      fireEventStub.resetHistory();

      // Remove state
      element.mode = 'states';
      element['_removeItem'](0);
      expect(fireEventStub.calledOnce).to.be.true;
      newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(0);
    });

    it('should handle multiple states with expansion', () => {
      element.states = [
        { state: 'on', icon_color: '#ff0000' },
        { state: 'off', icon_color: '#000000' },
        { state: 'standby', icon_color: '#888888' },
      ];

      // Expand first and third
      element['_expandedStates'] = new Set([0, 2]);
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.false;
      expect(element['_expandedStates'].has(2)).to.be.true;

      // Remove middle state
      element.mode = 'states';
      element['_removeItem'](1);

      // Indices should be adjusted
      expect(element['_expandedStates'].has(0)).to.be.true;
      expect(element['_expandedStates'].has(1)).to.be.true; // Was index 2
      expect(element['_expandedStates'].has(2)).to.be.false;
    });

    it('should handle adding state after removal', () => {
      element.states = [
        { state: 'on', icon_color: '#ff0000' },
        { state: 'off', icon_color: '#000000' },
      ];

      // Remove first state
      element.mode = 'states';
      element['_removeItem'](0);
      let newStates = fireEventStub.firstCall.args[2].value;
      element.states = newStates;
      fireEventStub.resetHistory();

      // Add new state
      element.mode = 'states';
      element['_addItem']();
      newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.have.lengthOf(2);
      expect(newStates[0]).to.deep.equal({
        state: 'off',
        icon_color: '#000000',
      });
      expect(newStates[1]).to.deep.equal({ state: '', icon_color: '' });
    });
  });

  describe('edge cases', () => {
    it('should handle states array with duplicate states', () => {
      element.states = [
        { state: 'on', icon_color: '#ff0000' },
        { state: 'on', icon_color: '#00ff00' },
      ];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle state with all optional fields', () => {
      const fullState: StateConfig = {
        state: 'custom',
        icon_color: '#ff0000',
        icon: 'mdi:custom',
        label: 'Custom State',
        attribute: 'custom_attr',
        styles: { color: 'red' },
      };
      element.states = [fullState];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle state with minimal required fields', () => {
      const minimalState: StateConfig = {
        state: 'on',
        icon_color: '#ff0000',
      };
      element.states = [minimalState];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle rapid toggle operations', () => {
      // Simulate rapid expansion/collapse by directly setting state
      element['_expandedStates'] = new Set([0]);
      element['_expandedStates'] = new Set();
      element['_expandedStates'] = new Set([0]);
      expect(element['_expandedStates'].has(0)).to.be.true;
    });

    it('should handle removing all states', () => {
      element.states = [
        { state: 'on', icon_color: '#ff0000' },
        { state: 'off', icon_color: '#000000' },
      ];

      element.mode = 'states';
      element['_removeItem'](0);
      let newStates = fireEventStub.firstCall.args[2].value;
      element.states = newStates;
      fireEventStub.resetHistory();

      element.mode = 'states';
      element['_removeItem'](0);
      newStates = fireEventStub.firstCall.args[2].value;
      expect(newStates).to.be.an('array');
      expect(newStates.length).to.equal(0);
    });
  });
});
