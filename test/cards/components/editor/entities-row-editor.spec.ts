import * as fireEventModule from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@hass/types';
import type { EntityConfig } from '@type/config/entity';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { RoomSummaryEntitiesRowEditor } from '../../../../src/cards/components/editor/entities-row-editor';

describe('entities-row-editor.ts', () => {
  let element: RoomSummaryEntitiesRowEditor;
  let mockHass: HomeAssistant;
  let fireEventStub: sinon.SinonStub;

  const mockEntityConfigs: EntityConfig[] = [
    { entity_id: 'light.living_room', label: 'Living Room' },
    { entity_id: 'switch.fan', icon: 'mdi:fan' },
  ];

  const mockLights: string[] = ['light.bedroom', 'light.kitchen'];

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => {
        const translations: Record<string, string> = {
          'ui.panel.lovelace.editor.card.generic.entities': 'Entities',
          'ui.panel.lovelace.editor.card.config.optional': 'optional',
          'ui.components.entity.entity-picker.clear': 'Clear',
          'ui.components.entity.entity-picker.edit': 'Edit',
        };
        return translations[key] || key;
      },
    } as any as HomeAssistant;

    element = new RoomSummaryEntitiesRowEditor();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('properties', () => {
    it('should initialize with default field as entities', () => {
      expect(element.field).to.equal('entities');
    });

    it('should set entities property', () => {
      element.entities = mockEntityConfigs;
      expect(element.entities).to.deep.equal(mockEntityConfigs);
    });

    it('should set lights property', () => {
      element.lights = mockLights;
      expect(element.lights).to.deep.equal(mockLights);
    });

    it('should set label property', () => {
      element.label = 'Custom Label';
      expect(element.label).to.equal('Custom Label');
    });

    it('should set availableEntities property', () => {
      const available = ['light.one', 'light.two'];
      element.availableEntities = available;
      expect(element.availableEntities).to.deep.equal(available);
    });
  });

  describe('_getKey', () => {
    it('should generate key from string entity', () => {
      const key = element['_getKey']('light.bedroom', 0);
      expect(key).to.equal('light.bedroom-0');
    });

    it('should generate key from EntityConfig', () => {
      const config = { entity_id: 'light.living_room', label: 'Living' };
      const key = element['_getKey'](config, 1);
      expect(key).to.equal('light.living_room-1');
    });

    it('should generate different keys for different indices', () => {
      const key1 = element['_getKey']('light.bedroom', 0);
      const key2 = element['_getKey']('light.bedroom', 1);
      expect(key1).to.not.equal(key2);
    });
  });

  describe('_getEntityId', () => {
    it('should return string entity id', () => {
      const entityId = element['_getEntityId']('light.bedroom');
      expect(entityId).to.equal('light.bedroom');
    });

    it('should extract entity_id from EntityConfig', () => {
      const config = { entity_id: 'light.living_room', label: 'Living' };
      const entityId = element['_getEntityId'](config);
      expect(entityId).to.equal('light.living_room');
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element.hass = undefined;
      const result = element['render']();
      expect(result).to.equal(nothing);
    });

    it('should render with default label when no custom label', () => {
      element.entities = mockEntityConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with custom label', () => {
      element.label = 'My Custom Entities';
      element.entities = mockEntityConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render entities when field is entities', () => {
      element.field = 'entities';
      element.entities = mockEntityConfigs;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render lights when field is lights', () => {
      element.field = 'lights';
      element.lights = mockLights;
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });

    it('should render with empty entities array', () => {
      element.field = 'entities';
      element.entities = [];
      const result = element['render']() as TemplateResult;
      expect(result).to.not.equal(nothing);
    });
  });

  describe('_addEntity', () => {
    it('should add entity to entities list', async () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.new' },
      });
      Object.defineProperty(event, 'target', { value: { value: '' } });

      await element['_addEntity'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('value-changed');
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(3);
      expect(newEntities[2]).to.equal('light.new');
    });

    it('should add light to lights list', async () => {
      element.field = 'lights';
      element.lights = [...mockLights];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.new' },
      });
      Object.defineProperty(event, 'target', { value: { value: '' } });

      await element['_addEntity'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newLights = fireEventStub.firstCall.args[2].value;
      expect(newLights).to.have.lengthOf(3);
      expect(newLights[2]).to.equal('light.new');
    });

    it('should not add entity when value is empty', async () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: '' },
      });

      await element['_addEntity'](event);

      expect(fireEventStub.called).to.be.false;
    });

    it('should handle undefined entities array', async () => {
      element.field = 'entities';
      element.entities = undefined;

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.new' },
      });
      Object.defineProperty(event, 'target', { value: { value: '' } });

      await element['_addEntity'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(1);
      expect(newEntities[0]).to.equal('light.new');
    });
  });

  describe('_removeRow', () => {
    it('should remove entity at specified index', () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 0 } });

      element['_removeRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(1);
      expect(newEntities[0]).to.deep.equal(mockEntityConfigs[1]);
    });

    it('should remove light at specified index', () => {
      element.field = 'lights';
      element.lights = [...mockLights];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 1 } });

      element['_removeRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newLights = fireEventStub.firstCall.args[2].value;
      expect(newLights).to.have.lengthOf(1);
      expect(newLights[0]).to.equal(mockLights[0]);
    });

    it('should handle removing from empty array', () => {
      element.field = 'entities';
      element.entities = [];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 0 } });

      element['_removeRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(0);
    });
  });

  describe('_valueChanged', () => {
    it('should update string entity at index', () => {
      element.field = 'entities';
      element.entities = ['light.one', 'light.two'];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.updated' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities[0]).to.equal('light.updated');
      expect(newEntities[1]).to.equal('light.two');
    });

    it('should update EntityConfig entity_id at index', () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.updated' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities[0].entity_id).to.equal('light.updated');
      expect(newEntities[0].label).to.equal('Living Room'); // Preserves other properties
    });

    it('should remove entity when value is empty string', () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: '' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(1);
    });

    it('should remove entity when value is undefined', () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('value-changed', {
        detail: { value: undefined },
      });
      Object.defineProperty(event, 'target', { value: { index: 1 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(1);
    });

    it('should update light at index', () => {
      element.field = 'lights';
      element.lights = [...mockLights];

      const event = new CustomEvent('value-changed', {
        detail: { value: 'light.updated' },
      });
      Object.defineProperty(event, 'target', { value: { index: 0 } });

      element['_valueChanged'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      const newLights = fireEventStub.firstCall.args[2].value;
      expect(newLights[0]).to.equal('light.updated');
      expect(newLights[1]).to.equal(mockLights[1]);
    });
  });

  describe('_editRow', () => {
    it('should fire edit-detail-element event for entity', () => {
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 0 } });

      element['_editRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('edit-detail-element');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        subElementConfig: {
          index: 0,
          type: 'entity',
          elementConfig: mockEntityConfigs[0],
          field: 'entities',
        },
      });
    });

    it('should fire edit-detail-element event for light', () => {
      element.field = 'lights';
      element.lights = [...mockLights];

      const event = new CustomEvent('click');
      Object.defineProperty(event, 'currentTarget', { value: { index: 1 } });

      element['_editRow'](event);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        subElementConfig: {
          index: 1,
          type: 'entity',
          elementConfig: mockLights[1],
          field: 'lights',
        },
      });
    });
  });

  describe('styles', () => {
    it('should have static styles defined', () => {
      expect(RoomSummaryEntitiesRowEditor.styles).to.exist;
    });

    it('should include entity picker styles', () => {
      const styles = RoomSummaryEntitiesRowEditor.styles.toString();
      expect(styles).to.include('ha-entity-picker');
    });

    it('should include entities container styles', () => {
      const styles = RoomSummaryEntitiesRowEditor.styles.toString();
      expect(styles).to.include('entities');
      expect(styles).to.include('flex-direction');
    });

    it('should include handle styles', () => {
      const styles = RoomSummaryEntitiesRowEditor.styles.toString();
      expect(styles).to.include('handle');
      expect(styles).to.include('cursor');
    });

    it('should include icon button styles', () => {
      const styles = RoomSummaryEntitiesRowEditor.styles.toString();
      expect(styles).to.include('remove-icon');
      expect(styles).to.include('edit-icon');
    });
  });

  describe('integration', () => {
    it('should handle complete workflow for entities', async () => {
      element.field = 'entities';
      element.entities = ['light.one'];

      // Add entity
      const addEvent = new CustomEvent('value-changed', {
        detail: { value: 'light.two' },
      });
      Object.defineProperty(addEvent, 'target', { value: { value: '' } });
      await element['_addEntity'](addEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      let newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities).to.have.lengthOf(2);

      // Update entities with new array
      element.entities = newEntities;
      fireEventStub.resetHistory();

      // Update entity
      const updateEvent = new CustomEvent('value-changed', {
        detail: { value: 'light.updated' },
      });
      Object.defineProperty(updateEvent, 'target', { value: { index: 0 } });
      element['_valueChanged'](updateEvent);

      expect(fireEventStub.calledOnce).to.be.true;
      newEntities = fireEventStub.firstCall.args[2].value;
      expect(newEntities[0]).to.equal('light.updated');
    });

    it('should handle field switching', () => {
      // Start with entities
      element.field = 'entities';
      element.entities = [...mockEntityConfigs];
      let result = element['render']();
      expect(result).to.not.equal(nothing);

      // Switch to lights
      element.field = 'lights';
      element.lights = [...mockLights];
      result = element['render']();
      expect(result).to.not.equal(nothing);
    });
  });
});
