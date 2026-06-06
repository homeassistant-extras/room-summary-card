import { RoomEntityLabel } from '@cards/components/room-state-icon/entity-label';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import * as renderLabelModule from '@html/render-label';
import { createStateEntity } from '@test/test-helpers';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('room-entity-label.ts', () => {
  let element: RoomEntityLabel;
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;
  let renderConfiguredEntityLabelStub: sinon.SinonStub;

  beforeEach(() => {
    const state = createStateEntity('light', 'living_room', 'on', {
      friendly_name: 'Living Room Light',
    });

    mockHass = {
      states: {
        'light.living_room': state,
      },
      formatEntityState: () => 'on',
    } as unknown as HomeAssistant;

    mockEntity = {
      config: { entity_id: 'light.living_room' },
      state,
    };

    renderConfiguredEntityLabelStub = stub(
      renderLabelModule,
      'renderConfiguredEntityLabel',
    ).returns(html`<span>Living Room Light</span>`);

    element = new RoomEntityLabel();
    element.hass = mockHass;
    element.entity = mockEntity;
    element.config = {
      area: 'living_room',
      features: ['show_entity_labels'],
    } as Config;
  });

  afterEach(() => {
    renderConfiguredEntityLabelStub.restore();
  });

  describe('render', () => {
    it('delegates to the shared entity label renderer', () => {
      const result = element.render();

      expect(result).to.not.equal(nothing);
      expect(
        renderConfiguredEntityLabelStub.calledWith(
          mockHass,
          mockEntity,
          element['_labelTemplateConn'],
          'entity-name',
        ),
      ).to.be.true;
    });
  });

  describe('disconnectedCallback', () => {
    it('disconnects any active template subscription', () => {
      const disconnectStub = stub(element['_labelTemplateConn'], 'disconnect');

      element.disconnectedCallback();

      expect(disconnectStub.calledOnce).to.be.true;
      disconnectStub.restore();
    });
  });
});
