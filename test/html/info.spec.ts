import type { HomeAssistant } from '@hass/types';
import * as areaStatsModule from '@html/area-statistics';
import { info } from '@html/info';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import * as textStylesModule from '@theme/render/text-styles';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { stub, type SinonStub } from 'sinon';

export default () => {
  describe('info.ts', () => {
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let mockRoomInformation: RoomInformation;
    let mockRoomEntity: EntityInformation;
    let mockElement: HTMLElement;
    let renderTextStylesStub: SinonStub;
    let renderAreaStatisticsStub: SinonStub;

    beforeEach(() => {
      mockElement = document.createElement('div');

      mockHass = {
        entities: {},
        devices: {},
        areas: {},
        states: {},
        themes: {
          theme: 'default',
          darkMode: false,
        },
      } as any as HomeAssistant;

      mockConfig = {
        area: 'living_room',
      } as any as Config;

      mockRoomInformation = {
        area_name: 'Living Room',
      };

      mockRoomEntity = {
        config: {
          entity_id: 'light.living_room',
          tap_action: { action: 'toggle' },
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
        },
        state: e('light', 'living_room', 'on'),
      };

      renderTextStylesStub = stub(textStylesModule, 'renderTextStyles').returns(
        styleMap({ '--text-color': 'var(--primary-color)' }),
      );

      renderAreaStatisticsStub = stub(
        areaStatsModule,
        'renderAreaStatistics',
      ).returns(html`<span class="stats">2 devices 3 entities</span>`);
    });

    afterEach(() => {
      renderTextStylesStub.restore();
      renderAreaStatisticsStub.restore();
    });

    describe('info component', () => {
      it('should render basic info structure with sensor-collection', async () => {
        const sensors: SensorData = {
          individual: [],
          averaged: [],
        };

        const result = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);

        expect(el.classList.contains('info')).to.be.true;

        const nameElement = el.querySelector('.name.text');
        expect(nameElement).to.exist;
        expect(nameElement!.textContent!.trim()).to.equal('Living Room');

        const sensorCollection = el.querySelector('sensor-collection');
        expect(sensorCollection).to.exist;
      });

      it('should pass correct props to sensor-collection', async () => {
        const sensors: SensorData = {
          individual: [e('sensor', 'temperature', '22')],
          averaged: [],
        };

        const result = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);
        const sensorCollection = el.querySelector('sensor-collection');

        expect(sensorCollection).to.exist;
        expect((sensorCollection as any).config).to.equal(mockConfig);
        expect((sensorCollection as any).sensors).to.equal(sensors);
        expect((sensorCollection as any).hass).to.equal(mockHass);
      });

      it('should call renderAreaStatistics', () => {
        const sensors: SensorData = { individual: [], averaged: [] };

        info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        expect(renderAreaStatisticsStub.calledOnce).to.be.true;
        expect(renderAreaStatisticsStub.calledWith(mockHass, mockConfig)).to.be
          .true;
      });

      it('should apply text styles to name element', async () => {
        const sensors: SensorData = { individual: [], averaged: [] };

        const result = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);
        const nameElement = el.querySelector('.name.text');

        expect(nameElement).to.exist;
        expect(renderTextStylesStub.calledOnce).to.be.true;
        expect(
          renderTextStylesStub.calledWith(mockHass, mockConfig, mockRoomEntity),
        ).to.be.true;
      });

      it('should handle when renderAreaStatistics returns nothing', async () => {
        renderAreaStatisticsStub.returns(nothing);
        const sensors: SensorData = { individual: [], averaged: [] };

        const result = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);

        expect(el.querySelector('.name')).to.exist;
        expect(el.querySelector('sensor-collection')).to.exist;
      });

      it('should handle special characters in room names', async () => {
        const complexRoomInfo = { area_name: 'Master Bedroom & En-Suite' };
        const sensors: SensorData = { individual: [], averaged: [] };

        const result = info(
          mockElement,
          mockHass,
          complexRoomInfo,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);
        const nameElement = el.querySelector('.name.text');
        expect(nameElement!.textContent!.trim()).to.equal(
          'Master Bedroom & En-Suite',
        );
      });
    });
  });
};
