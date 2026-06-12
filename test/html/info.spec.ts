import type { AreaStatistics } from '@cards/components/area-statistics/area-statistics';
import { SensorCollection } from '@cards/components/sensor-collection/sensor-collection';
import * as fireEventModule from '@homeassistant-extras/hass/common/dom/fire_event';
import * as actionHandlerDirective from '@homeassistant-extras/hass/panels/lovelace/common/directives/action-handler-directive';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { info } from '@html/info';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity as e } from '@test/test-helpers';
import * as textStylesModule from '@theme/render/text-styles';
import type { Config } from '@type/config';
import type { EntityInformation, RoomInformation } from '@type/room';
import type { SensorData } from '@type/sensor';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { stub, type SinonStub } from 'sinon';

if (!customElements.get('sensor-collection')) {
  customElements.define('sensor-collection', SensorCollection);
}

describe('info.ts', () => {
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let mockRoomInformation: RoomInformation;
  let mockRoomEntity: EntityInformation;
  let mockElement: HTMLElement;
  let renderTextStylesStub: SinonStub;
  let hassActionHandlerStub: SinonStub;
  let fireEventStub: SinonStub;

  beforeEach(() => {
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

    mockElement = document.createElement('div');

    renderTextStylesStub = stub(textStylesModule, 'renderTextStyles').returns(
      styleMap({ '--text-color': 'var(--primary-color)' }),
    );

    // Stub the action handler dependencies
    hassActionHandlerStub = stub(
      actionHandlerDirective,
      'actionHandler',
    ).returns(html`<div class="action-handler-stub"></div>`);
    fireEventStub = stub(fireEventModule, 'fireEvent');
  });

  afterEach(() => {
    renderTextStylesStub.restore();
    hassActionHandlerStub.restore();
    fireEventStub.restore();
  });

  describe('info component', () => {
    it('should render basic info structure with sensor-collection', async () => {
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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
      expect(nameElement!.textContent.trim()).to.equal('Living Room');

      const sensorCollection = el.querySelector('sensor-collection');
      expect(sensorCollection).to.exist;
    });

    it('should pass correct props to sensor-collection', async () => {
      const sensors: SensorData = {
        individual: [e('sensor', 'temperature', '22')],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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
      expect((sensorCollection as any)._hass).to.equal(mockHass);
    });

    it('should pass hass and config to area-statistics', async () => {
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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
      const stats = el.querySelector('area-statistics');
      expect(stats).to.exist;
      expect((stats as any).hass).to.equal(mockHass);
      expect((stats as any).config).to.equal(mockConfig);
    });

    it('should apply text styles to name element', async () => {
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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
      expect(renderTextStylesStub.calledOnce).to.be.true;
      expect(
        renderTextStylesStub.calledWith(mockHass, mockConfig, mockRoomEntity),
      ).to.be.true;
    });

    it('should omit stats when hide_area_stats is enabled', async () => {
      mockConfig.features = ['hide_area_stats'];
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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

      const areaStats = el.querySelector('area-statistics');
      expect(areaStats).to.exist;
      await (areaStats as AreaStatistics).updateComplete;

      expect(el.querySelector('.name')).to.exist;
      expect(el.querySelector('sensor-collection')).to.exist;
      expect(areaStats!.shadowRoot?.querySelector('.stats')).to.not.exist;
    });

    it('should handle special characters in room names', async () => {
      const complexRoomInfo = { area_name: 'Master Bedroom & En-Suite' };
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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
      expect(nameElement!.textContent.trim()).to.equal(
        'Master Bedroom & En-Suite',
      );
    });

    it('should attach action handlers to the text div', async () => {
      const sensors: SensorData = {
        individual: [],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
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

      // Check that the text div exists and has the correct structure
      const textDiv = el.querySelector('.text');
      expect(textDiv).to.exist;

      // Check that the text div has the action event listener attached
      expect(textDiv).to.have.property('actionHandler');

      // Check that the name element is inside the text div
      const nameElement = textDiv!.querySelector('.name.text');
      expect(nameElement).to.exist;
      expect(nameElement?.textContent?.trim()).to.equal('Living Room');

      expect(textDiv!.querySelector('area-statistics')).to.exist;
    });
  });
});
