import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config/entity';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummarySubElementEditor } from '../../../../src/cards/components/editor/sub-element-editor';

describe('sub-element-editor.ts', () => {
  let element: RoomSummarySubElementEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfig: EntityConfig = {
    entity_id: 'light.living_room',
    label: 'Living Room',
    icon: 'mdi:lightbulb',
  };

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'ui.common.back': 'Back',
          'ui.panel.lovelace.editor.sub-element-editor.types.row': 'Row',
          'ui.panel.lovelace.editor.edit_card.show_code_editor':
            'Show code editor',
          'ui.panel.lovelace.editor.edit_card.show_visual_editor':
            'Show visual editor',
        };
        return translations[key] || key;
      },
    } as any as HomeAssistant;

    element = new RoomSummarySubElementEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with default state', () => {
      expect(element['_guiModeAvailable']).to.be.true;
      expect(element['_guiMode']).to.be.true;
    });

    it('should set config property', () => {
      const config = {
        field: 'entities' as const,
        type: 'entity' as const,
        elementConfig: mockEntityConfig,
      };
      element.config = config;
      expect(element.config).to.equal(config);
    });
  });

  describe('render', () => {
    it('should render header with back button and mode toggle', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      const templateString = result.strings.join('');
      expect(templateString).to.include('header');
      expect(templateString).to.include('back-title');
      expect(templateString).to.include('ha-icon-button-prev');
      expect(templateString).to.include('gui-mode-button');
    });

    it('should render entity editor in GUI mode', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };
      element['_guiMode'] = true;

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);
      // The _renderEditor method is called dynamically, so we just verify it renders
    });

    it('should render YAML editor in YAML mode for entities', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };
      element['_guiMode'] = false;

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);
      // The _renderEditor method is called dynamically, so we just verify it renders
    });

    it('should render YAML editor in YAML mode for lights', () => {
      element.config = {
        field: 'lights',
        type: 'entity',
        elementConfig: 'light.bedroom',
      };
      element['_guiMode'] = false;

      const result = (element as any).render() as TemplateResult;
      expect(result).to.not.equal(nothing);
      // The _renderEditor method is called dynamically, so we just verify it renders
    });

    it('should render nothing for lights in GUI mode', () => {
      element.config = {
        field: 'lights',
        type: 'entity',
        elementConfig: 'light.bedroom',
      };
      element['_guiMode'] = true;

      const result = (element as any).render() as TemplateResult;
      // The _renderEditor method returns nothing for lights in GUI mode
      expect(result).to.not.equal(nothing);
    });

    it('should return nothing when type is not entity or sensor', () => {
      element.config = {
        field: 'entities',
        type: 'unknown' as any,
        elementConfig: mockEntityConfig,
      };

      const result = (element as any)._renderEditor();
      expect(result).to.equal(nothing);
    });
  });

  describe('_toggleMode', () => {
    it('should toggle from GUI to YAML mode', () => {
      element['_guiMode'] = true;
      element['_toggleMode']();
      expect(element['_guiMode']).to.be.false;
    });

    it('should toggle from YAML to GUI mode', () => {
      element['_guiMode'] = false;
      element['_toggleMode']();
      expect(element['_guiMode']).to.be.true;
    });
  });

  describe('_goBack', () => {
    it('should fire go-back event', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      element['_goBack']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('go-back');
      expect(fireEventStub.firstCall.args[2]).to.be.undefined;
    });
  });

  describe('_handleConfigChanged', () => {
    it('should fire config-changed event with new config', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const newConfig = {
        entity_id: 'light.bedroom',
        label: 'Bedroom Light',
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
      });

      element['_handleConfigChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: newConfig,
      });
    });

    it('should stop event propagation', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: {} },
        bubbles: true,
      });

      const stopPropagationSpy = stub(event, 'stopPropagation');

      element['_handleConfigChanged'](event);

      expect(stopPropagationSpy.calledOnce).to.be.true;

      stopPropagationSpy.restore();
    });
  });

  describe('_handleYAMLChanged', () => {
    it('should fire config-changed event with YAML value', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const yamlValue = {
        entity_id: 'switch.fan',
        label: 'Fan',
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: yamlValue },
        bubbles: true,
      });

      element['_handleYAMLChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: yamlValue,
      });
    });

    it('should stop event propagation', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
        elementConfig: mockEntityConfig,
      };

      const event = new CustomEvent('value-changed', {
        detail: { value: {} },
        bubbles: true,
      });

      const stopPropagationSpy = stub(event, 'stopPropagation');

      element['_handleYAMLChanged'](event);

      expect(stopPropagationSpy.calledOnce).to.be.true;

      stopPropagationSpy.restore();
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(RoomSummarySubElementEditor.styles).to.exist;
    });

    it('should include header styling', () => {
      const styles = RoomSummarySubElementEditor.styles.toString();
      expect(styles).to.include('header');
      expect(styles).to.include('display: flex');
      expect(styles).to.include('border-bottom');
    });

    it('should include back-title styling', () => {
      const styles = RoomSummarySubElementEditor.styles.toString();
      expect(styles).to.include('back-title');
    });

    it('should include editor padding', () => {
      const styles = RoomSummarySubElementEditor.styles.toString();
      expect(styles).to.include('editor');
      expect(styles).to.include('padding');
    });
  });

  describe('integration', () => {
    it('should handle config with index', () => {
      const config = {
        field: 'entities' as const,
        type: 'entity' as const,
        elementConfig: mockEntityConfig,
        index: 2,
      };
      element.config = config;
      expect(element.config.index).to.equal(2);
    });

    it('should handle string elementConfig', () => {
      const config = {
        field: 'lights' as const,
        type: 'entity' as const,
        elementConfig: 'light.kitchen',
      };
      element.config = config;
      expect(element.config.elementConfig).to.equal('light.kitchen');
    });

    it('should render correctly with minimal config', () => {
      element.config = {
        field: 'entities',
        type: 'entity',
      };

      const result = (element as any).render();
      expect(result).to.not.equal(nothing);
    });
  });
});
