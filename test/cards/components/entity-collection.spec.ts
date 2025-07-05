import { EntityCollection } from '@cards/components/entity-collection/entity-collection';
import * as iconEntitiesModule from '@delegates/entities/icon-entities';
import type { HomeAssistant } from '@hass/types';
import * as iconModule from '@html/icon';
import { fixture } from '@open-wc/testing-helpers';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config, EntityConfig } from '@type/config';
import type { EntityInformation, EntityState } from '@type/room';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { styles } from '@cards/components/entity-collection/styles';

describe('entity-collection.ts', () => {
  let element: EntityCollection;
  let mockHass: HomeAssistant;
  let getIconEntitiesStub: sinon.SinonStub;
  let renderStateIconStub: sinon.SinonStub;
  let stylesToHostCssStub: sinon.SinonStub;

  const mockEntityStates: EntityState[] = [
    {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: { friendly_name: 'Living Room Light' },
      domain: 'light',
    },
    {
      entity_id: 'switch.living_room_fan',
      state: 'off',
      attributes: { friendly_name: 'Living Room Fan' },
      domain: 'switch',
    },
    {
      entity_id: 'sensor.temperature',
      state: '72',
      attributes: { friendly_name: 'Temperature', unit_of_measurement: '°F' },
      domain: 'sensor',
    },
  ];

  const mockEntityConfigs: EntityConfig[] = [
    { entity_id: 'light.living_room' },
    { entity_id: 'switch.living_room_fan' },
    { entity_id: 'sensor.temperature' },
  ] as EntityConfig[];

  const mockEntities: EntityInformation[] = [
    {
      config: mockEntityConfigs[0]!,
      state: mockEntityStates[0],
    },
    {
      config: mockEntityConfigs[1]!,
      state: mockEntityStates[1],
    },
    {
      config: mockEntityConfigs[2]!,
      state: mockEntityStates[2],
    },
  ];

  beforeEach(() => {
    getIconEntitiesStub = stub(iconEntitiesModule, 'getIconEntities').returns(
      mockEntities,
    );
    renderStateIconStub = stub(iconModule, 'renderStateIcon').returns(
      html`<ha-state-icon></ha-state-icon>`,
    );
    stylesToHostCssStub = stub(styleConverterModule, 'stylesToHostCss').returns(
      html`<style>
        :host {
          display: grid;
        }
      </style>`,
    );

    mockHass = {
      states: {
        'light.living_room': mockEntityStates[0],
        'switch.living_room_fan': mockEntityStates[1],
        'sensor.temperature': mockEntityStates[2],
      },
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;

    element = new EntityCollection();
    element.config = {
      area: 'living_room',
      entities: ['light.living_room', 'switch.living_room_fan'],
    } as Config;
  });

  afterEach(() => {
    getIconEntitiesStub.restore();
    renderStateIconStub.restore();
    stylesToHostCssStub.restore();
  });

  describe('hass property setter', () => {
    it('should set internal hass and update entities', () => {
      element.hass = mockHass;

      expect(element['_hass']).to.equal(mockHass);
      expect(getIconEntitiesStub.calledWith(mockHass, element.config)).to.be
        .true;
      expect(element['_entities']).to.deep.equal(mockEntities);
    });

    it('should not update entities if they have not changed', () => {
      // Set initial entities
      element.hass = mockHass;
      const initialEntities = element['_entities'];

      // Reset stub call count
      getIconEntitiesStub.resetHistory();

      // Set hass again with same entities
      element.hass = mockHass;

      expect(getIconEntitiesStub.calledWith(mockHass, element.config)).to.be
        .true;
      expect(element['_entities']).to.equal(initialEntities);
    });

    it('should update entities when they change', () => {
      // Set initial entities
      element.hass = mockHass;

      // Create new entities array
      const newEntities: EntityInformation[] = [
        {
          config: { entity_id: 'light.bedroom' } as EntityConfig,
          state: {
            entity_id: 'light.bedroom',
            state: 'off',
            attributes: { friendly_name: 'Bedroom Light' },
            domain: 'light',
          },
        },
      ];

      getIconEntitiesStub.returns(newEntities);

      // Set hass again with different entities
      element.hass = mockHass;

      expect(element['_entities']).to.deep.equal(newEntities);
    });
  });

  describe('render', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should render nothing when hass is not set', () => {
      element['_hass'] = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    it('should render nothing when entities are not set', () => {
      element['_entities'] = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    it('should render entities when both hass and entities are available', async () => {
      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Verify stylesToHostCss is called
      expect(stylesToHostCssStub.called).to.be.true;

      // Verify renderStateIcon is called for each entity
      expect(renderStateIconStub.callCount).to.equal(mockEntities.length);

      // Verify each entity is rendered with correct parameters
      mockEntities.forEach((entity, index) => {
        const call = renderStateIconStub.getCall(index);
        expect(call.args[0]).to.equal(element); // this context
        expect(call.args[1]).to.equal(mockHass); // hass instance
        expect(call.args[2]).to.equal(entity); // entity
        expect(call.args[3]).to.deep.equal(['entity']); // CSS classes
      });
    });

    it('should call stylesToHostCss with config styles', async () => {
      element.config = {
        styles: { entities: { 'grid-template-columns': 'repeat(3, 1fr)' } },
      } as any as Config;

      await fixture(element.render() as TemplateResult);

      expect(
        stylesToHostCssStub.calledWith({
          'grid-template-columns': 'repeat(3, 1fr)',
        }),
      ).to.be.true;
    });

    it('should handle config without styles', async () => {
      element.config = { area: 'living_room' } as Config;

      await fixture(element.render() as TemplateResult);

      expect(stylesToHostCssStub.calledWith(undefined)).to.be.true;
    });

    it('should render empty array when no entities', () => {
      element['_entities'] = [];

      const result = element.render() as TemplateResult;
      expect(result).to.not.equal(nothing);

      // Should still call stylesToHostCss
      expect(stylesToHostCssStub.called).to.be.true;
      // But renderStateIcon should not be called
      expect(renderStateIconStub.called).to.be.false;
    });
  });

  describe('integration with getIconEntities', () => {
    it('should pass correct parameters to getIconEntities', () => {
      const customConfig = {
        area: 'bedroom',
        entities: ['light.bedroom'],
        entity_types: ['light', 'switch'],
      } as Config;
      element.config = customConfig;

      element.hass = mockHass;

      expect(getIconEntitiesStub.calledWith(mockHass, customConfig)).to.be.true;
    });

    it('should handle empty entities from getIconEntities', () => {
      getIconEntitiesStub.returns([]);

      element.hass = mockHass;

      expect(element['_entities']).to.deep.equal([]);
    });
  });

  describe('deep equality check', () => {
    it('should not trigger update when entities are deeply equal', () => {
      // Set initial entities
      element.hass = mockHass;
      const updateSpy = stub(element, 'requestUpdate');

      // Create a new array with same content (different reference)
      const sameEntities: EntityInformation[] = mockEntities.map((entity) => ({
        config: { ...entity.config },
        state: entity.state ? { ...entity.state } : undefined,
      }));
      getIconEntitiesStub.returns(sameEntities);

      // Set hass again
      element.hass = mockHass;

      // Should not have triggered an update since entities are deeply equal
      expect(element['_entities']).to.not.equal(sameEntities); // Different reference
      expect(element['_entities']).to.deep.equal(mockEntities); // Same content

      updateSpy.restore();
    });
  });

  describe('styles', () => {
    it('should return entityStyles', () => {
      expect(EntityCollection.styles).to.equal(styles);
    });
  });
});
