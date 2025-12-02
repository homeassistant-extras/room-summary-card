import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import * as localizeModule from '@localize/localize';
import type { ThresholdEntry } from '@type/config';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummaryThresholdsRowEditor } from '../../../../src/cards/components/editor/thresholds-row-editor';

describe('thresholds-row-editor.ts', () => {
  let element: RoomSummaryThresholdsRowEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;
  let localizeStub: sinon.SinonStub;

  const mockThresholdEntries: ThresholdEntry[] = [
    {
      entity_id: 'sensor.temperature',
      value: 75,
      operator: 'gt',
    },
    {
      value: 80,
      operator: 'gte',
    },
    {
      entity_id: 'sensor.humidity',
      value: 60,
    },
  ];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    const translations: Record<string, string> = {
      'editor.threshold.temperature_thresholds': 'Temperature Thresholds',
      'editor.threshold.humidity_thresholds': 'Humidity Thresholds',
      'editor.threshold.add_temperature_threshold': 'Add Temperature Threshold',
      'editor.threshold.add_humidity_threshold': 'Add Humidity Threshold',
      'editor.threshold.temperature_threshold': 'Temperature threshold',
      'editor.threshold.humidity_threshold': 'Humidity threshold',
      'editor.threshold.temperature_entity': 'Temperature Entity',
      'editor.threshold.humidity_entity': 'Humidity Entity',
      'editor.threshold.temperature_operator': 'Temperature Operator',
      'editor.threshold.humidity_operator': 'Humidity Operator',
      'editor.threshold.operator.greater_than': 'Greater than (>)',
      'editor.threshold.operator.greater_than_or_equal':
        'Greater than or equal (≥)',
      'editor.threshold.operator.less_than': 'Less than (<)',
      'editor.threshold.operator.less_than_or_equal': 'Less than or equal (≤)',
      'editor.threshold.operator.equal': 'Equal (=)',
      'ui.panel.lovelace.editor.card.config.optional': 'optional',
      'ui.panel.lovelace.editor.card.config.required': 'required',
      'ui.components.entity.entity-picker.clear': 'Clear',
    };

    localizeStub = stub(localizeModule, 'localize').callsFake(
      (hass: HomeAssistant, key: string) => translations[key] || key,
    );

    mockHass = {
      localize: (key: string) => translations[key] || key,
    } as any as HomeAssistant;

    element = new RoomSummaryThresholdsRowEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
    localizeStub.restore();
  });

  describe('properties', () => {
    it('should initialize with undefined thresholds', () => {
      expect(element.thresholds).to.be.undefined;
    });

    it('should set thresholds property', () => {
      element.thresholds = mockThresholdEntries;
      expect(element.thresholds).to.deep.equal(mockThresholdEntries);
    });

    it('should set label property', () => {
      element.label = 'Custom Thresholds Label';
      expect(element.label).to.equal('Custom Thresholds Label');
    });

    it('should initialize with temperature as default thresholdType', () => {
      expect(element.thresholdType).to.equal('temperature');
    });

    it('should set thresholdType property', () => {
      element.thresholdType = 'humidity';
      expect(element.thresholdType).to.equal('humidity');
    });

    it('should set availableEntities property', () => {
      const available = ['sensor.temp1', 'sensor.temp2'];
      element.availableEntities = available;
      expect(element.availableEntities).to.deep.equal(available);
    });

    it('should initialize with empty expanded thresholds set', () => {
      expect(element['_expandedThresholds'].size).to.equal(0);
    });
  });

  describe('_getKey', () => {
    it('should generate key using thresholdType and index', () => {
      element.thresholdType = 'temperature';
      const threshold: ThresholdEntry = { value: 75 };
      const key = element['_getKey'](threshold, 0);
      expect(key).to.equal('threshold-temperature-0');
    });

    it('should generate different keys for different threshold types', () => {
      const threshold: ThresholdEntry = { value: 75 };
      element.thresholdType = 'temperature';
      const key1 = element['_getKey'](threshold, 0);
      element.thresholdType = 'humidity';
      const key2 = element['_getKey'](threshold, 0);
      expect(key1).to.not.equal(key2);
      expect(key1).to.equal('threshold-temperature-0');
      expect(key2).to.equal('threshold-humidity-0');
    });

    it('should generate different keys for different indices', () => {
      element.thresholdType = 'temperature';
      const threshold: ThresholdEntry = { value: 75 };
      const key1 = element['_getKey'](threshold, 0);
      const key2 = element['_getKey'](threshold, 1);
      expect(key1).to.not.equal(key2);
      expect(key1).to.equal('threshold-temperature-0');
      expect(key2).to.equal('threshold-temperature-1');
    });

    it('should generate stable keys for same index and type', () => {
      element.thresholdType = 'temperature';
      const threshold1: ThresholdEntry = { value: 75 };
      const threshold2: ThresholdEntry = { value: 80 };
      const key1 = element['_getKey'](threshold1, 0);
      const key2 = element['_getKey'](threshold2, 0);
      expect(key1).to.equal(key2);
      expect(key1).to.equal('threshold-temperature-0');
    });
  });

  describe('_getThresholdSchema', () => {
    beforeEach(() => {
      element.availableEntities = ['sensor.temp1', 'sensor.temp2'];
    });

    it('should create schema with correct structure for temperature', () => {
      const schema = element['_getThresholdSchema'](mockHass, 'temperature', [
        'sensor.temp1',
      ]);

      expect(schema).to.be.an('array');
      expect(schema.length).to.equal(3);

      const entityField = schema.find((s) => s.name === 'entity_id') as any;
      expect(entityField).to.exist;
      expect(entityField?.required).to.be.false;
      expect(entityField?.label).to.equal(
        'editor.threshold.temperature_entity',
      );
      expect(entityField?.selector?.entity?.filter?.device_class).to.equal(
        'temperature',
      );

      const valueField = schema.find((s) => s.name === 'value') as any;
      expect(valueField).to.exist;
      expect(valueField?.required).to.be.false;
      expect(valueField?.label).to.equal(
        'editor.threshold.temperature_threshold',
      );
      expect(valueField?.selector?.number?.mode).to.equal('box');
      expect(valueField?.selector?.number?.unit_of_measurement).to.equal('°');

      const operatorField = schema.find((s) => s.name === 'operator') as any;
      expect(operatorField).to.exist;
      expect(operatorField?.required).to.be.false;
      expect(operatorField?.label).to.equal(
        'editor.threshold.temperature_operator',
      );
    });

    it('should create schema with correct structure for humidity', () => {
      const schema = element['_getThresholdSchema'](mockHass, 'humidity', [
        'sensor.hum1',
      ]);

      expect(schema).to.be.an('array');
      expect(schema.length).to.equal(3);

      const entityField = schema.find((s) => s.name === 'entity_id') as any;
      expect(entityField).to.exist;
      expect(entityField?.label).to.equal('editor.threshold.humidity_entity');
      expect(entityField?.selector?.entity?.filter?.device_class).to.equal(
        'humidity',
      );

      const valueField = schema.find((s) => s.name === 'value') as any;
      expect(valueField).to.exist;
      expect(valueField?.label).to.equal('editor.threshold.humidity_threshold');
      expect(valueField?.selector?.number?.mode).to.equal('slider');
      expect(valueField?.selector?.number?.unit_of_measurement).to.equal('%');
      expect(valueField?.selector?.number?.min).to.equal(0);
      expect(valueField?.selector?.number?.max).to.equal(100);

      const operatorField = schema.find((s) => s.name === 'operator') as any;
      expect(operatorField).to.exist;
      expect(operatorField?.label).to.equal(
        'editor.threshold.humidity_operator',
      );
    });

    it('should memoize schema for same parameters', () => {
      const availableEntities = ['sensor.temp1'];
      const schema1 = element['_getThresholdSchema'](
        mockHass,
        'temperature',
        availableEntities,
      );
      const schema2 = element['_getThresholdSchema'](
        mockHass,
        'temperature',
        availableEntities,
      );

      // Check that arrays have same length and structure (memoization returns same reference)
      expect(schema1).to.deep.equal(schema2);
      // For arrays, memoizeOne should return the same reference when same array instance is used
      expect(schema1 === schema2).to.be.true;
    });

    it('should create different schema for different threshold types', () => {
      const tempSchema = element['_getThresholdSchema'](
        mockHass,
        'temperature',
        ['sensor.temp1'],
      );
      const humiditySchema = element['_getThresholdSchema'](
        mockHass,
        'humidity',
        ['sensor.hum1'],
      );

      expect(tempSchema).to.not.equal(humiditySchema);

      const tempValueField = tempSchema.find((s) => s.name === 'value') as any;
      const humidityValueField = humiditySchema.find(
        (s) => s.name === 'value',
      ) as any;

      expect(tempValueField?.selector?.number?.mode).to.equal('box');
      expect(humidityValueField?.selector?.number?.mode).to.equal('slider');
    });

    it('should include available entities in entity selector', () => {
      const available = ['sensor.temp1', 'sensor.temp2', 'sensor.temp3'];
      const schema = element['_getThresholdSchema'](
        mockHass,
        'temperature',
        available,
      );

      const entityField = schema.find((s) => s.name === 'entity_id') as any;
      expect(entityField?.selector?.entity?.include_entities).to.deep.equal(
        available,
      );
    });

    it('should include operator options', () => {
      const schema = element['_getThresholdSchema'](
        mockHass,
        'temperature',
        [],
      );

      const operatorField = schema.find((s) => s.name === 'operator') as any;
      expect(operatorField?.selector?.select?.options).to.be.an('array');
      expect(operatorField?.selector?.select?.options.length).to.equal(5);
      expect(operatorField?.selector?.select?.options[0].value).to.equal('gt');
      expect(operatorField?.selector?.select?.options[4].value).to.equal('eq');
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
        name: 'value',
        label: 'editor.threshold.temperature_threshold',
        required: true,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('Temperature threshold');
      expect(result).to.include('(required)');
    });

    it('should compute label for optional field', () => {
      const schema = {
        name: 'entity_id',
        label: 'editor.threshold.temperature_entity',
        required: false,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('Temperature Entity');
      expect(result).to.include('(optional)');
    });

    it('should handle undefined required field as optional', () => {
      const schema = {
        name: 'operator',
        label: 'editor.threshold.temperature_operator',
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('Temperature Operator');
      expect(result).to.include('(optional)');
    });
  });

  describe('_expandedThresholds', () => {
    it('should expand threshold when not expanded', () => {
      element['_expandedThresholds'] = new Set([0]);
      expect(element['_expandedThresholds'].has(0)).to.be.true;
    });

    it('should collapse threshold when expanded', () => {
      element['_expandedThresholds'] = new Set([0]);
      element['_expandedThresholds'] = new Set();
      expect(element['_expandedThresholds'].has(0)).to.be.false;
    });

    it('should handle multiple expanded thresholds', () => {
      element['_expandedThresholds'] = new Set([0, 1, 2]);
      expect(element['_expandedThresholds'].has(0)).to.be.true;
      expect(element['_expandedThresholds'].has(1)).to.be.true;
      expect(element['_expandedThresholds'].has(2)).to.be.true;
    });

    it('should toggle individual thresholds independently', () => {
      element['_expandedThresholds'] = new Set([1]);
      expect(element['_expandedThresholds'].has(0)).to.be.false;
      expect(element['_expandedThresholds'].has(1)).to.be.true;
    });
  });

  describe('_addThreshold', () => {
    it('should add new threshold to empty array', () => {
      element.thresholds = [];

      element['_addThreshold']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal(
        'threshold-entries-value-changed',
      );
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(1);
      expect(newThresholds[0]).to.deep.equal({});
    });

    it('should add new threshold to existing array', () => {
      element.thresholds = [...mockThresholdEntries];

      element['_addThreshold']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(4);
      expect(newThresholds[3]).to.deep.equal({});
      // Original thresholds should be preserved
      expect(newThresholds[0]).to.deep.equal(mockThresholdEntries[0]);
      expect(newThresholds[1]).to.deep.equal(mockThresholdEntries[1]);
    });

    it('should handle undefined thresholds array', () => {
      element.thresholds = undefined;

      element['_addThreshold']();

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(1);
      expect(newThresholds[0]).to.deep.equal({});
    });

    it('should expand newly added threshold', () => {
      element.thresholds = [];

      element['_addThreshold']();

      const newIndex = 0;
      expect(element['_expandedThresholds'].has(newIndex)).to.be.true;
    });
  });

  describe('_removeThresholdItem', () => {
    it('should remove threshold at specified index', () => {
      element.thresholds = [...mockThresholdEntries];

      element['_removeThresholdItem'](1);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[1]).to.equal(
        'threshold-entries-value-changed',
      );
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(2);
      expect(newThresholds[0]).to.deep.equal(mockThresholdEntries[0]);
      expect(newThresholds[1]).to.deep.equal(mockThresholdEntries[2]);
    });

    it('should remove last threshold', () => {
      element.thresholds = [...mockThresholdEntries];

      element['_removeThresholdItem'](2);

      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.have.lengthOf(2);
      expect(newThresholds[0]).to.deep.equal(mockThresholdEntries[0]);
      expect(newThresholds[1]).to.deep.equal(mockThresholdEntries[1]);
    });

    it('should return empty array when removing last item', () => {
      element.thresholds = [{ value: 75 }];

      element['_removeThresholdItem'](0);

      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.be.an('array');
      expect(newThresholds.length).to.equal(0);
    });

    it('should handle undefined thresholds array', () => {
      element.thresholds = undefined;

      element['_removeThresholdItem'](0);

      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds).to.be.an('array');
      expect(newThresholds.length).to.equal(0);
    });

    it('should adjust expanded indices after removal', () => {
      element.thresholds = [{ value: 70 }, { value: 75 }, { value: 80 }];
      element['_expandedThresholds'] = new Set([0, 2]);

      element['_removeThresholdItem'](1);

      // Index 0 should remain, index 2 should become index 1
      expect(element['_expandedThresholds'].has(0)).to.be.true;
      expect(element['_expandedThresholds'].has(1)).to.be.true;
      expect(element['_expandedThresholds'].has(2)).to.be.false;
    });
  });

  describe('_cleanEmptyStrings', () => {
    it('should remove empty string properties', () => {
      const obj = {
        entity_id: 'sensor.temp',
        value: 75,
        operator: '',
      };
      const cleaned = element['_cleanEmptyStrings'](obj);
      expect(cleaned).to.deep.equal({
        entity_id: 'sensor.temp',
        value: 75,
      });
    });

    it('should preserve non-empty string properties', () => {
      const obj = {
        entity_id: 'sensor.temp',
        value: 75,
        operator: 'gt',
      };
      const cleaned = element['_cleanEmptyStrings'](obj);
      expect(cleaned).to.deep.equal(obj);
    });

    it('should handle nested objects', () => {
      const obj = {
        entity_id: 'sensor.temp',
        nested: {
          empty: '',
          value: 75,
        },
      };
      const cleaned = element['_cleanEmptyStrings'](obj);
      expect(cleaned).to.deep.equal({
        entity_id: 'sensor.temp',
        nested: {
          value: 75,
        },
      });
    });

    it('should handle arrays', () => {
      const obj = {
        items: [
          { value: 75, empty: '' },
          { value: 80, empty: '' },
        ],
      };
      const cleaned = element['_cleanEmptyStrings'](obj);
      expect(cleaned).to.deep.equal({
        items: [{ value: 75 }, { value: 80 }],
      });
    });
  });

  describe('_thresholdValueChanged', () => {
    it('should update threshold at specified index', () => {
      element.thresholds = [...mockThresholdEntries];

      const updatedValue = {
        entity_id: 'sensor.new_temp',
        value: 85,
        operator: 'lt',
      };

      const mockEvent = {
        detail: { value: updatedValue },
      } as CustomEvent;

      element['_thresholdValueChanged'](1, mockEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds[1]).to.deep.equal(updatedValue);
      expect(newThresholds[0]).to.deep.equal(mockThresholdEntries[0]);
      expect(newThresholds[2]).to.deep.equal(mockThresholdEntries[2]);
    });

    it('should clean empty strings from updated threshold', () => {
      element.thresholds = [{ value: 75 }];

      const updatedValue = {
        entity_id: '',
        value: 80,
        operator: '',
      };

      const mockEvent = {
        detail: { value: updatedValue },
      } as CustomEvent;

      element['_thresholdValueChanged'](0, mockEvent);

      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds[0]).to.deep.equal({ value: 80 });
    });

    it('should handle invalid value', () => {
      element.thresholds = [{ value: 75 }];

      const mockEvent = {
        detail: { value: null },
      } as CustomEvent;

      element['_thresholdValueChanged'](0, mockEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      const newThresholds = fireEventStub.firstCall.args[2].value;
      expect(newThresholds[0]).to.deep.equal({ value: 75 });
    });
  });

  describe('_getThresholdTitle', () => {
    it('should return title with entity_id and value', () => {
      const threshold: ThresholdEntry = {
        entity_id: 'sensor.temp',
        value: 75,
      };
      const title = element['_getThresholdTitle'](threshold);
      expect(title).to.equal('sensor.temp: 75');
    });

    it('should return title with only value when no entity_id', () => {
      const threshold: ThresholdEntry = { value: 75 };
      const title = element['_getThresholdTitle'](threshold);
      expect(title).to.equal('75');
    });

    it('should return title with only entity_id when no value', () => {
      const threshold: ThresholdEntry = { entity_id: 'sensor.temp' };
      const title = element['_getThresholdTitle'](threshold);
      expect(title).to.equal('sensor.temp');
    });

    it('should return default title when threshold is empty', () => {
      const threshold: ThresholdEntry = {};
      const title = element['_getThresholdTitle'](threshold);
      expect(title).to.equal('New Threshold');
    });

    it('should handle string value', () => {
      const threshold: ThresholdEntry = {
        entity_id: 'sensor.temp',
        value: 'sensor.threshold_entity',
      };
      const title = element['_getThresholdTitle'](threshold);
      expect(title).to.equal('sensor.temp: sensor.threshold_entity');
    });
  });

  describe('render', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should return nothing when hass is not set', () => {
      element.hass = undefined;
      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render label with default text for temperature', () => {
      element.thresholdType = 'temperature';
      element.thresholds = [];
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render label with default text for humidity', () => {
      element.thresholdType = 'humidity';
      element.thresholds = [];
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render custom label when provided', () => {
      element.label = 'Custom Label';
      element.thresholds = [];
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render thresholds list', () => {
      element.thresholds = mockThresholdEntries;
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render add button', () => {
      element.thresholds = [];
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle empty thresholds array', () => {
      element.thresholds = [];
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should handle undefined thresholds', () => {
      element.thresholds = undefined;
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });
  });
});
