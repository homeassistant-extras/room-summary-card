import * as actionHandlerModule from '@/delegates/action-handler-delegate';
import type { HomeAssistant } from '@hass/types';
import * as areaStatsModule from '@html/area-statistics';
import { info } from '@html/info';
import * as sensorsModule from '@html/sensors';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import * as textStylesModule from '@theme/render/text-styles';
import type {
  Config,
  EntityInformation,
  RoomInformation,
  SensorData,
} from '@type/config';
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
    let actionHandlerStub: SinonStub;
    let handleClickActionStub: SinonStub;
    let renderTextStylesStub: SinonStub;
    let renderSensorsStub: SinonStub;
    let renderAreaStatisticsStub: SinonStub;

    beforeEach(() => {
      // Create mock element
      mockElement = document.createElement('div');

      // Set up mock Home Assistant
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

      // Set up mock config
      mockConfig = {
        area: 'living_room',
        sensor_layout: 'horizontal',
      } as any as Config;

      // Set up mock room information
      mockRoomInformation = {
        area_name: 'Living Room',
      };

      // Set up mock room entity
      mockRoomEntity = {
        config: {
          entity_id: 'light.living_room',
          tap_action: { action: 'toggle' },
          hold_action: { action: 'more-info' },
          double_tap_action: { action: 'none' },
        },
        state: e('light', 'living_room', 'on'),
      };

      // Create stubs for all dependencies
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {},
        handleAction: () => {},
      });

      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: () => {},
      });

      renderTextStylesStub = stub(textStylesModule, 'renderTextStyles').returns(
        styleMap({ '--text-color': 'var(--primary-color)' }),
      );

      renderSensorsStub = stub(sensorsModule, 'renderSensors').returns(
        html`<span>22°C, 45%</span>`,
      );

      renderAreaStatisticsStub = stub(
        areaStatsModule,
        'renderAreaStatistics',
      ).returns(html`<span class="stats">2 devices 3 entities</span>`);
    });

    afterEach(() => {
      actionHandlerStub.restore();
      handleClickActionStub.restore();
      renderTextStylesStub.restore();
      renderSensorsStub.restore();
      renderAreaStatisticsStub.restore();
    });

    describe('info component', () => {
      it('should render the basic info structure', async () => {
        const sensors: SensorData = {
          individual: [
            e('sensor', 'temperature', '22', { device_class: 'temperature' }),
            e('sensor', 'humidity', '45', { device_class: 'humidity' }),
          ],
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

        // Check main structure
        expect(el.classList.contains('info')).to.be.true;
        expect(el.classList.contains('horizontal')).to.be.true;

        // Check room name
        const nameElement = el.querySelector('.name.text');
        expect(nameElement).to.exist;
        expect(nameElement!.textContent!.trim()).to.equal('Living Room');

        // Check label container
        const labelElement = el.querySelector('.sensors.text');
        expect(labelElement).to.exist;
      });

      it('should apply correct CSS classes based on sensor_layout config', async () => {
        const sensors: SensorData = {
          individual: [e('sensor', 'temperature', '22')],
          averaged: [],
        };

        // Test with vertical layout
        const verticalConfig = {
          ...mockConfig,
          sensor_layout: 'vertical',
        } as any as Config;
        const verticalResult = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          verticalConfig,
          sensors,
        );

        const verticalEl = await fixture(verticalResult as TemplateResult);
        expect(verticalEl.classList.contains('vertical')).to.be.true;

        // Test with horizontal layout
        const horizontalConfig = {
          ...mockConfig,
          sensor_layout: 'horizontal',
        } as any as Config;
        const horizontalResult = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          horizontalConfig,
          sensors,
        );

        const horizontalEl = await fixture(horizontalResult as TemplateResult);
        expect(horizontalEl.classList.contains('horizontal')).to.be.true;
      });

      it('should call actionHandler with correct parameters', () => {
        const sensors: SensorData = {
          individual: [e('sensor', 'temperature', '22')],
          averaged: [],
        };

        info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        expect(actionHandlerStub.calledOnce).to.be.true;
        expect(actionHandlerStub.calledWith(mockRoomEntity)).to.be.true;
      });

      it('should call handleClickAction with correct parameters', () => {
        const sensors: SensorData = {
          individual: [e('sensor', 'temperature', '22')],
          averaged: [],
        };

        info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        expect(handleClickActionStub.calledOnce).to.be.true;
        expect(handleClickActionStub.calledWith(mockElement, mockRoomEntity)).to
          .be.true;
      });

      it('should call renderSensors with correct parameters', () => {
        const sensors: SensorData = {
          individual: [
            e('sensor', 'temperature', '22'),
            e('sensor', 'humidity', '45'),
          ],
          averaged: [],
        };

        info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        expect(renderSensorsStub.calledOnce).to.be.true;
        expect(renderSensorsStub.calledWith(mockHass, mockConfig, sensors)).to
          .be.true;
      });

      it('should call renderAreaStatistics with correct parameters', () => {
        const sensors: SensorData = {
          individual: [e('sensor', 'temperature', '22')],
          averaged: [],
        };

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

      it('should handle empty sensors data', async () => {
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
        expect(el.className).to.equal('info horizontal');
        expect(renderSensorsStub.calledWith(mockHass, mockConfig, sensors)).to
          .be.true;
      });

      it('should handle averaged sensors', async () => {
        const sensors: SensorData = {
          individual: [],
          averaged: [
            {
              states: [e('sensor', 'temp1', '20'), e('sensor', 'temp2', '24')],
              uom: '°C',
              average: 22,
              device_class: 'temperature',
              domain: 'sensor',
            },
          ],
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
        expect(el.className).to.equal('info horizontal');
        expect(renderSensorsStub.calledWith(mockHass, mockConfig, sensors)).to
          .be.true;
      });

      it('should apply action handlers to the room name element', async () => {
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
        const nameElement = el.querySelector('.name.text');

        expect(nameElement).to.exist;
        expect((nameElement as any).actionHandler).to.exist;
      });

      it('should apply text styles to both name and label elements', async () => {
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

        // Both name and label should have the text styles applied
        const nameElement = el.querySelector('.name.text');
        const labelElement = el.querySelector('.sensors.text');

        expect(nameElement).to.exist;
        expect(labelElement).to.exist;

        // Check that renderTextStyles was called once
        expect(renderTextStylesStub.callCount).to.equal(1);
        expect(
          renderTextStylesStub.calledWith(mockHass, mockConfig, mockRoomEntity),
        ).to.be.true;
      });

      it('should handle undefined sensor_layout in config', async () => {
        const configWithoutLayout = { ...mockConfig };
        delete (configWithoutLayout as any).sensor_layout;

        const sensors: SensorData = {
          individual: [],
          averaged: [],
        };

        const result = info(
          mockElement,
          mockHass,
          mockRoomInformation,
          mockRoomEntity,
          configWithoutLayout,
          sensors,
        );

        const el = await fixture(result as TemplateResult);

        // Should default to having undefined class (which would be handled by CSS)
        expect(el.className).to.equal('info ');
      });

      it('should render when renderSensors returns nothing', async () => {
        renderSensorsStub.returns(nothing);

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
        expect(el.className).to.equal('info horizontal');
        expect(el.querySelector('.name')).to.exist;
      });

      it('should render when renderAreaStatistics returns nothing', async () => {
        renderAreaStatisticsStub.returns(nothing);

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
        expect(el.className).to.equal('info horizontal');
        expect(el.querySelector('.name')).to.exist;
      });

      it('should handle complex room names with special characters', async () => {
        const complexRoomInfo = {
          area_name: 'Master Bedroom & En-Suite',
        };

        const sensors: SensorData = {
          individual: [],
          averaged: [],
        };

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

      it('should handle very long room names', async () => {
        const longRoomInfo = {
          area_name: 'This is a very long room name that might overflow',
        };

        const sensors: SensorData = {
          individual: [],
          averaged: [],
        };

        const result = info(
          mockElement,
          mockHass,
          longRoomInfo,
          mockRoomEntity,
          mockConfig,
          sensors,
        );

        const el = await fixture(result as TemplateResult);
        const nameElement = el.querySelector('.name.text');
        expect(nameElement!.textContent!.trim()).to.equal(
          'This is a very long room name that might overflow',
        );
      });
    });
  });
};
