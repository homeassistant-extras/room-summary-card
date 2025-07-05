import { RoomSummaryCard } from '@/cards/card';
import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import * as setupCardModule from '@/delegates/utils/setup-card';
import type { HomeAssistant } from '@hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { styles } from '@theme/styles';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';
import { createState as s } from '../test-helpers';

export default () => {
  describe('card.ts', () => {
    let card: RoomSummaryCard;
    let mockHass: HomeAssistant;
    let actionHandlerStub: sinon.SinonStub;
    let getRoomPropertiesStub: sinon.SinonStub;

    beforeEach(() => {
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {},
        handleAction: () => {},
      });
      getRoomPropertiesStub = stub(
        setupCardModule,
        'getRoomProperties',
      ).returns({
        roomInfo: { area_name: 'Living Room' },
        roomEntity: {
          config: { entity_id: 'light.test' },
          state: {
            entity_id: 'light.test',
            state: 'on',
            attributes: {},
            domain: 'light',
          },
        },
        problemEntities: [],
        sensors: { individual: [], averaged: [] },
        image: null,
        flags: {
          problemExists: false,
          occupied: true,
          dark: true,
          hot: false,
          humid: false,
        },
      });
      card = new RoomSummaryCard();
      mockHass = {
        states: {
          'light.living_room': s('light', 'living_room', 'on'),
          'switch.living_room_fan': s('switch', 'living_room_fan', 'off'),
        },
        devices: {
          device_1: { area_id: 'living_room' },
          device_2: { area_id: 'living_room' },
        },
        entities: {
          'light.living_room': {
            device_id: 'device_1',
            area_id: 'living_room',
            labels: [],
          },
          'switch.living_room_fan': {
            device_id: 'device_2',
            area_id: 'living_room',
            labels: [],
          },
        },
        areas: {
          living_room: { area_id: 'living_room', icon: '' },
          bedroom: { area_id: 'bedroom', icon: '' },
        },
        themes: { darkMode: true, theme: 'default' },
        formatEntityState: () => 'formatted state',
      } as any as HomeAssistant;
      card.setConfig({ area: 'living_room' });
      card.hass = mockHass;
    });

    afterEach(() => {
      actionHandlerStub.restore();
      getRoomPropertiesStub.restore();
    });

    describe('setConfig', () => {
      it('should set the config', () => {
        const config = { area: 'living_room' };
        card.setConfig(config);
        expect(card['_config']).to.deep.equal(config);
      });

      it('should set backgroundImage to true when config has background image', () => {
        const config = {
          area: 'living_room',
          background: {
            image: '/local/images/living-room.jpg',
          },
        };
        card.setConfig(config);
        expect(card['backgroundImage']).to.be.true;
      });

      it('should set backgroundImage to true when config has background image_entity', () => {
        const config = {
          area: 'living_room',
          background: {
            image_entity: 'camera.living_room',
          },
        };
        card.setConfig(config);
        expect(card['backgroundImage']).to.be.true;
      });

      it('should set backgroundImage to false when config has no background image', () => {
        const config = { area: 'living_room' };
        card.setConfig(config);
        expect(card['backgroundImage']).to.be.false;
      });

      it('should set backgroundImage to false when background options include disable', () => {
        const config = {
          area: 'living_room',
          background: {
            image: '/local/images/living-room.jpg',
            options: ['disable' as const],
          },
        };
        card.setConfig(config);
        expect(card['backgroundImage']).to.be.false;
      });
    });

    describe('hass property setter', () => {
      it('should update internal state and flags from getRoomProperties', () => {
        expect(card['_roomEntity']).to.exist;
        expect(card['_sensors']).to.exist;
        expect(card['_roomInformation']).to.exist;
        expect(card['dark']).to.be.true; // Since mockHass has darkMode: true
        expect(card['occupied']).to.be.true; // Should be set based on occupancy state
      });

      it('should update _hass when formatEntityState changes', () => {
        const newHass = {
          ...mockHass,
          formatEntityState: () => 'new formatted state',
        } as any as HomeAssistant;

        card.hass = newHass;
        expect(card['_hass']).to.equal(newHass);
      });
    });

    describe('styles', () => {
      it('should return expected styles', () => {
        expect(RoomSummaryCard.styles).to.deep.equal(styles);
      });
    });

    describe('rendering', () => {
      it('should render nothing if no hass', () => {
        (card as any)._hass = undefined;
        expect(card.render()).to.equal(nothing);
      });

      it('should render the basic card structure', async () => {
        const el = await fixture(card.render() as TemplateResult);
        expect(el.tagName).to.equal('HA-CARD');
        expect(el.querySelector('.grid')).to.exist;
      });

      it('should render problem entities correctly', async () => {
        card['_problemEntities'] = ['light.living_room', 'sensor.humidity'];
        card['_problemExists'] = true;
        const el = await fixture(card.render() as TemplateResult);
        const problemIcon = el.querySelector('.status-entities')!;
        expect(problemIcon).to.exist;
        expect((problemIcon as any).icon).to.equal('mdi:numeric-2');
      });

      it('should call actionHandler and handleClickAction for hitbox', async () => {
        const handleClickActionStub = stub(
          actionHandlerModule,
          'handleClickAction',
        ).returns({
          handleEvent: () => {},
        });

        const el = await fixture(card.render() as TemplateResult);
        const hitbox = el.querySelector('.hitbox');

        expect(hitbox).to.exist;
        expect((hitbox as any).actionHandler).to.exist;
        expect(actionHandlerStub.calledWith(card['_roomEntity'])).to.be.true;
        expect(handleClickActionStub.calledWith(card, card['_roomEntity'])).to
          .be.true;

        handleClickActionStub.restore();
      });

      it('should hide room icon content when hide_icon_only background option is enabled', async () => {
        const config = {
          area: 'living_room',
          background: {
            image: '/local/images/living-room.jpg',
            options: ['hide_icon_only' as const],
          },
        };
        card.setConfig(config);
        const el = await fixture(card.render() as TemplateResult);
        const roomIconContainer = el.querySelector('.room');
        const roomIconContent = el.querySelector('.room ha-state-icon');
        expect(roomIconContainer).to.exist;
        expect(roomIconContent).to.not.exist;
      });
    });

    describe('getStubConfig()', () => {
      it('should return first area with matching entities', async () => {
        const config = await RoomSummaryCard.getStubConfig(mockHass);
        expect(config.area).to.equal('living_room');
      });

      it('should return empty string if no areas have matching entities', async () => {
        const emptyHass = {
          ...mockHass,
          entities: {},
          areas: { kitchen: { area_id: 'kitchen', name: 'Kitchen' } },
        };
        const config = await RoomSummaryCard.getStubConfig(emptyHass as any);
        expect(config.area).to.equal('');
      });
    });
  });
};
