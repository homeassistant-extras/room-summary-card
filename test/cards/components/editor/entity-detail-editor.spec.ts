import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import type { EntityConfig, StateConfig } from '@type/config/entity';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummaryEntityDetailEditor } from '../../../../src/cards/components/editor/entity-detail-editor';
import { RoomSummaryStatesRowEditor } from '../../../../src/cards/components/editor/states-row-editor';

describe('entity-detail-editor.ts', () => {
  let element: RoomSummaryEntityDetailEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfig: EntityConfig = {
    entity_id: 'light.living_room',
    label: 'Living Room',
    icon: 'mdi:lightbulb',
    on_color: '#ffcc00',
    off_color: '#cccccc',
  };

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    // Register custom elements needed for tests
    if (!customElements.get('room-summary-states-row-editor')) {
      customElements.define(
        'room-summary-states-row-editor',
        RoomSummaryStatesRowEditor,
      );
    }

    mockHass = {
      language: 'en',
      localize: (key: string) => {
        if (key === 'ui.panel.lovelace.editor.card.config.required') {
          return 'required';
        }
        if (key === 'ui.panel.lovelace.editor.card.config.optional') {
          return 'optional';
        }
        return key;
      },
    } as any as HomeAssistant;

    element = new RoomSummaryEntityDetailEditor();
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with undefined config', () => {
      expect(element['_config']).to.be.undefined;
    });

    it('should set hass property', () => {
      element.hass = mockHass;
      expect(element.hass).to.equal(mockHass);
    });
  });

  describe('setConfig', () => {
    it('should accept EntityConfig object', () => {
      element.setConfig(mockEntityConfig);
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });

    it('should accept string and convert to EntityConfig', () => {
      element.setConfig('light.bedroom');
      expect(element['_config']).to.deep.equal({ entity_id: 'light.bedroom' });
    });

    it('should create a copy of the config object', () => {
      element.setConfig(mockEntityConfig);
      expect(element['_config']).to.not.equal(mockEntityConfig);
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });
  });

  describe('value property', () => {
    it('should set value with EntityConfig', () => {
      element.value = mockEntityConfig;
      expect(element['_config']).to.deep.equal(mockEntityConfig);
    });

    it('should set value with string', () => {
      element.value = 'switch.fan';
      expect(element['_config']).to.deep.equal({ entity_id: 'switch.fan' });
    });

    it('should clear config when value is undefined', () => {
      element.value = mockEntityConfig;
      expect(element['_config']).to.not.be.undefined;

      element.value = undefined;
      expect(element['_config']).to.be.undefined;
    });

    it('should get value as EntityConfig', () => {
      element['_config'] = mockEntityConfig;
      expect(element.value).to.equal(mockEntityConfig);
    });

    it('should return undefined when no config is set', () => {
      expect(element.value).to.be.undefined;
    });
  });

  describe('schema', () => {
    it('should create schema with correct structure', () => {
      element.hass = mockHass;
      const schema = element['_entitiesSchema']('light.living_room', mockHass);

      const expectedSchema = [
        {
          name: 'entity_id',
          required: true,
          label: 'editor.entity.entity_id',
          selector: { entity: {} },
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'label',
              label: 'editor.entity.entity_label',
              selector: { text: {} },
            },
            {
              name: 'attribute',
              label: 'editor.entity.entity_attribute',
              selector: { attribute: { entity_id: 'light.living_room' } },
            },
            {
              name: 'icon',
              label: 'editor.entity.entity_icon',
              selector: {
                icon: {},
              },
            },
          ],
        },
        {
          type: 'grid',
          name: '',
          label: 'editor.entity.entity_label',
          schema: [
            {
              name: 'on_color',
              label: 'editor.entity.entity_on_color',
              selector: { ui_color: {} },
            },
            {
              name: 'off_color',
              label: 'editor.entity.entity_off_color',
              selector: { ui_color: {} },
            },
          ],
        },
        {
          name: 'features',
          label: 'editor.features.features',
          required: false,
          selector: {
            select: {
              multiple: true,
              mode: 'list' as const,
              options: [
                {
                  label: 'Use Entity Icon',
                  value: 'use_entity_icon',
                },
              ],
            },
          },
        },
        {
          name: 'interactions',
          label: 'editor.interactions.interactions',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:gesture-tap',
          schema: [
            {
              name: 'tap_action',
              label: 'editor.interactions.tap_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'toggle',
                },
              },
            },
            {
              name: 'double_tap_action',
              label: 'editor.interactions.double_tap_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'more-info',
                },
              },
            },
            {
              name: 'hold_action',
              label: 'editor.interactions.hold_action',
              required: false,
              selector: {
                ui_action: {
                  default_action: 'none',
                },
              },
            },
          ],
        },
        {
          name: 'styles',
          label: 'editor.styles.css_styles',
          type: 'expandable',
          flatten: true,
          icon: 'mdi:brush-variant',
          schema: [
            {
              name: 'styles',
              label: 'editor.entity.styles',
              required: false,
              selector: { object: {} },
            },
          ],
        },
      ];

      expect(schema).to.deep.equal(expectedSchema);
    });

    it('should memoize schema', () => {
      element.hass = mockHass;
      const schema1 = element['_entitiesSchema']('light.living_room', mockHass);
      const schema2 = element['_entitiesSchema']('light.living_room', mockHass);

      expect(schema1).to.equal(schema2); // Same reference due to memoization
    });

    it('should have correct selector types in schema', () => {
      element.hass = mockHass;
      const schema = element['_entitiesSchema']('light.living_room', mockHass);
      const firstGridSchema = (schema[1] as any).schema;
      const secondGridSchema = (schema[2] as any).schema;

      expect(firstGridSchema![0]).to.deep.include({
        name: 'label',
        label: 'editor.entity.entity_label',
      });
      expect(firstGridSchema![0]?.selector).to.deep.equal({ text: {} });

      expect(firstGridSchema![1]).to.deep.include({
        name: 'attribute',
        label: 'editor.entity.entity_attribute',
      });
      expect(firstGridSchema![1]?.selector).to.deep.equal({
        attribute: { entity_id: 'light.living_room' },
      });

      expect(firstGridSchema![2]).to.deep.include({
        name: 'icon',
        label: 'editor.entity.entity_icon',
      });
      expect(firstGridSchema![2]?.selector).to.deep.equal({ icon: {} });

      expect(secondGridSchema![0]).to.deep.include({
        name: 'on_color',
        label: 'editor.entity.entity_on_color',
      });
      expect(secondGridSchema![0]?.selector).to.deep.equal({ ui_color: {} });

      expect(secondGridSchema![1]).to.deep.include({
        name: 'off_color',
        label: 'editor.entity.entity_off_color',
      });
      expect(secondGridSchema![1]?.selector).to.deep.equal({ ui_color: {} });
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element['_config'] = mockEntityConfig;
      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render nothing when config is not set', () => {
      element.hass = mockHass;
      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render ha-form when hass and config are set', () => {
      element.hass = mockHass;
      element['_config'] = mockEntityConfig;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render ha-form with correct properties', () => {
      element.hass = mockHass;
      element['_config'] = mockEntityConfig;

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify the template includes ha-form tag
      const templateString = result.strings.join('');
      expect(templateString).to.include('ha-form');
    });

    it('should render states row editor when type is entity and entity_id is set', async () => {
      element.hass = mockHass;
      element.type = 'entity';
      element['_config'] = mockEntityConfig;

      const result = element.render() as TemplateResult;
      // Wrap in a container div to ensure proper querying
      const wrappedResult = html`<div>${result}</div>`;
      const el = await fixture(wrappedResult);

      const statesRowEditor = el.querySelector(
        'room-summary-states-row-editor',
      );
      expect(statesRowEditor).to.exist;
      expect((statesRowEditor as any).entityId).to.equal(
        mockEntityConfig.entity_id,
      );
      expect((statesRowEditor as any).hass).to.equal(mockHass);
    });

    it('should render states row editor but not thresholds when type is sensor', async () => {
      element.hass = mockHass;
      element.type = 'sensor';
      element['_config'] = mockEntityConfig;

      const result = element.render() as TemplateResult;
      // Wrap in a container div to ensure proper querying
      const wrappedResult = html`<div>${result}</div>`;
      const el = await fixture(wrappedResult);

      const statesRowEditors = el.querySelectorAll(
        'room-summary-states-row-editor',
      );
      // Should have one states row editor (for states)
      expect(statesRowEditors.length).to.equal(1);
      // Should not have thresholds (mode should be 'states')
      const statesRowEditor = statesRowEditors[0] as RoomSummaryStatesRowEditor;
      expect(statesRowEditor.mode).to.equal('states');
    });

    it('should not render states row editor when entity_id is missing', async () => {
      element.hass = mockHass;
      element.type = 'entity';
      element['_config'] = { label: 'Test' } as EntityConfig;

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const statesRowEditor = el.querySelector(
        'room-summary-states-row-editor',
      );
      expect(statesRowEditor).to.not.exist;
    });

    it('should not render states row editor when entity_id is empty string', async () => {
      element.hass = mockHass;
      element.type = 'entity';
      element['_config'] = { entity_id: '' } as EntityConfig;

      const result = element.render() as TemplateResult;
      const el = await fixture(result);

      const statesRowEditor = el.querySelector(
        'room-summary-states-row-editor',
      );
      expect(statesRowEditor).to.not.exist;
    });

    it('should pass states array to states row editor when config has states', async () => {
      const statesConfig: StateConfig[] = [
        { state: 'on', icon_color: '#00ff00' },
        { state: 'off', icon_color: '#ff0000' },
      ];
      element.hass = mockHass;
      element.type = 'entity';
      element['_config'] = {
        ...mockEntityConfig,
        states: statesConfig,
      };

      const result = element.render() as TemplateResult;
      // Wrap in a container div to ensure proper querying
      const wrappedResult = html`<div>${result}</div>`;
      const el = await fixture(wrappedResult);

      const statesRowEditor = el.querySelector(
        'room-summary-states-row-editor',
      );
      expect(statesRowEditor).to.exist;
      expect((statesRowEditor as any).states).to.deep.equal(statesConfig);
    });

    it('should pass undefined states to states row editor when config has no states', async () => {
      element.hass = mockHass;
      element.type = 'entity';
      element['_config'] = mockEntityConfig;

      const result = element.render() as TemplateResult;
      // Wrap in a container div to ensure proper querying
      const wrappedResult = html`<div>${result}</div>`;
      const el = await fixture(wrappedResult);

      const statesRowEditor = el.querySelector(
        'room-summary-states-row-editor',
      );
      expect(statesRowEditor).to.exist;
      expect((statesRowEditor as any).states).to.be.undefined;
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
        name: 'entity_id',
        label: 'editor.entity_id',
        required: true,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('(required)');
    });

    it('should compute label for optional field', () => {
      const schema = {
        name: 'label',
        label: 'editor.entity.entity_label',
        required: false,
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('(optional)');
    });

    it('should handle undefined required field as optional', () => {
      const schema = {
        name: 'icon',
        label: 'editor.entity.entity_icon',
      };
      const result = element['_computeLabelCallback'](schema as any);
      expect(result).to.include('(optional)');
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with new value', () => {
      element.hass = mockHass;
      element['_config'] = mockEntityConfig;

      const newConfig = {
        entity_id: 'light.bedroom',
        label: 'Bedroom Light',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: newConfig },
      });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: newConfig,
      });
    });

    it('should handle value-changed events from ha-form', () => {
      element.hass = mockHass;
      element['_config'] = mockEntityConfig;

      const updatedConfig = {
        ...mockEntityConfig,
        icon: 'mdi:lamp',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedConfig },
      });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const eventArgs = fireEventStub.firstCall.args[2];
      expect(eventArgs.config).to.deep.equal(updatedConfig);
    });
  });

  describe('_statesValueChanged', () => {
    const mockStateConfig1: StateConfig = {
      state: 'on',
      icon_color: '#00ff00',
    };
    const mockStateConfig2: StateConfig = {
      state: 'off',
      icon_color: '#ff0000',
    };
    const mockStateConfig3: StateConfig = {
      state: 'auto',
      icon_color: '#0000ff',
      icon: 'mdi:auto',
    };

    beforeEach(() => {
      element.hass = mockHass;
      element['_config'] = mockEntityConfig;
    });

    it('should return early when config is undefined', () => {
      element['_config'] = undefined;

      const event = new CustomEvent('states-value-changed', {
        detail: { value: [mockStateConfig1, mockStateConfig2] },
      });

      element['_statesValueChanged'](event);

      expect(fireEventStub.called).to.be.false;
    });

    it('should warn and return early when states value is not an array', () => {
      const consoleWarnStub = stub(console, 'warn');

      const event = new CustomEvent('states-value-changed', {
        detail: { value: { on: 'on', off: 'off' } },
      });

      element['_statesValueChanged'](event);

      expect(consoleWarnStub.calledOnce).to.be.true;
      expect(consoleWarnStub.firstCall.args[0]).to.include(
        'States value is not an array:',
      );
      expect(fireEventStub.called).to.be.false;

      consoleWarnStub.restore();
    });

    it('should fire config-changed event with states when array has items', () => {
      const statesArray: StateConfig[] = [
        mockStateConfig1,
        mockStateConfig2,
        mockStateConfig3,
      ];

      const event = new CustomEvent('states-value-changed', {
        detail: { value: statesArray },
      });

      element['_statesValueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: {
          ...mockEntityConfig,
          states: statesArray,
        },
      });
    });

    it('should remove states property when array is empty', () => {
      const configWithStates: EntityConfig = {
        ...mockEntityConfig,
        states: [mockStateConfig1, mockStateConfig2],
      };
      element['_config'] = configWithStates;

      const event = new CustomEvent('states-value-changed', {
        detail: { value: [] },
      });

      element['_statesValueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newConfig = fireEventStub.firstCall.args[2].config;
      expect(newConfig).to.not.have.property('states');
      expect(newConfig).to.deep.equal(mockEntityConfig);
    });

    it('should preserve other config properties when updating states', () => {
      const oldState: StateConfig = {
        state: 'old',
        icon_color: '#888888',
      };
      const configWithExtraProps: EntityConfig = {
        ...mockEntityConfig,
        label: 'Custom Label',
        icon: 'mdi:custom-icon',
        on_color: '#ff0000',
        states: [oldState],
      };
      element['_config'] = configWithExtraProps;

      const newStates: StateConfig[] = [mockStateConfig1, mockStateConfig2];

      const event = new CustomEvent('states-value-changed', {
        detail: { value: newStates },
      });

      element['_statesValueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newConfig = fireEventStub.firstCall.args[2].config;
      expect(newConfig.states).to.deep.equal(newStates);
      expect(newConfig.label).to.equal('Custom Label');
      expect(newConfig.icon).to.equal('mdi:custom-icon');
      expect(newConfig.on_color).to.equal('#ff0000');
      expect(newConfig.entity_id).to.equal(mockEntityConfig.entity_id);
    });

    it('should handle states array with single item', () => {
      const event = new CustomEvent('states-value-changed', {
        detail: { value: [mockStateConfig1] },
      });

      element['_statesValueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[2].config.states).to.deep.equal([
        mockStateConfig1,
      ]);
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(RoomSummaryEntityDetailEditor.styles).to.exist;
    });

    it('should apply padding to ha-form', () => {
      // Verify the styles include padding for ha-form
      const styles = RoomSummaryEntityDetailEditor.styles.toString();
      expect(styles).to.include('ha-form');
      expect(styles).to.include('padding');
      expect(styles).to.include('16px');
    });
  });

  describe('integration', () => {
    it('should work with string entity_id input and config changes', () => {
      element.hass = mockHass;
      element.value = 'light.kitchen';

      expect(element.value).to.deep.equal({ entity_id: 'light.kitchen' });

      const newConfig = {
        entity_id: 'light.kitchen',
        label: 'Kitchen Light',
        icon: 'mdi:ceiling-light',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: newConfig },
      });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: newConfig,
      });
    });

    it('should handle complete entity configuration workflow', () => {
      // Initial setup
      element.hass = mockHass;
      element.value = 'light.hallway';

      expect(element['_config']).to.deep.equal({ entity_id: 'light.hallway' });

      // User edits configuration
      const updatedConfig: EntityConfig = {
        entity_id: 'light.hallway',
        label: 'Hallway',
        icon: 'mdi:wall-sconce',
        on_color: '#ffffff',
        off_color: '#444444',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: updatedConfig },
      });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[2].config).to.deep.equal(
        updatedConfig,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle setting value multiple times', () => {
      element.value = 'light.one';
      expect(element['_config']?.entity_id).to.equal('light.one');

      element.value = 'light.two';
      expect(element['_config']?.entity_id).to.equal('light.two');

      element.value = { entity_id: 'light.three', label: 'Three' };
      expect(element['_config']?.entity_id).to.equal('light.three');
      expect(element['_config']?.label).to.equal('Three');
    });

    it('should handle clearing and resetting value', () => {
      element.value = mockEntityConfig;
      expect(element['_config']).to.not.be.undefined;

      element.value = undefined;
      expect(element['_config']).to.be.undefined;

      element.value = 'light.new';
      expect(element['_config']).to.deep.equal({ entity_id: 'light.new' });
    });

    it('should handle empty string entity_id', () => {
      element.setConfig('');
      expect(element['_config']).to.deep.equal({ entity_id: '' });
    });

    it('should handle config with only entity_id', () => {
      const minimalConfig = { entity_id: 'sensor.temperature' };
      element.value = minimalConfig;

      expect(element['_config']).to.deep.equal(minimalConfig);
    });
  });
});
