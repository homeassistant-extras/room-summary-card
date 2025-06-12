import * as featureModule from '@/config/feature';
import { SensorCollection } from '@cards/components/sensor-collection';
import * as iconModule from '@delegates/retrievers/icons';
import * as sensorUtilsModule from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config, EntityState, SensorData } from '@type/config';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('sensor-collection.ts', () => {
  let element: SensorCollection;
  let mockHass: HomeAssistant;
  let hasFeatureStub: sinon.SinonStub;
  let getIconResourcesStub: sinon.SinonStub;
  let sensorDataToDisplayStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;

  beforeEach(() => {
    hasFeatureStub = stub(featureModule, 'hasFeature').returns(false);
    getIconResourcesStub = stub(iconModule, 'getIconResources').resolves({
      resources: {},
    });
    sensorDataToDisplayStub = stub(
      sensorUtilsModule,
      'sensorDataToDisplaySensors',
    ).returns('Averaged Display');
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay').returns(
      html`<span>formatted state</span>`,
    );

    mockHass = {
      states: {},
      formatEntityState: () => 'formatted state',
    } as any as HomeAssistant;

    element = new SensorCollection();
    element.config = { sensor_layout: 'default' } as Config;
    element.sensors = {
      averaged: [
        {
          domain: 'sensor',
          device_class: 'temperature',
          states: [{ entity_id: 'sensor.temp1', state: '20' }],
        },
      ],
      individual: [{ entity_id: 'sensor.humidity', state: '45' }],
    } as SensorData;
  });

  afterEach(() => {
    hasFeatureStub.restore();
    getIconResourcesStub.restore();
    sensorDataToDisplayStub.restore();
    stateDisplayStub.restore();
  });

  describe('hass property setter', () => {
    it('should set internal hass and update flags', () => {
      element.hass = mockHass;

      expect(element['_hass']).to.equal(mockHass);
      expect(hasFeatureStub.calledWith(element.config, 'hide_sensor_icons')).to
        .be.true;
    });

    it('should set layout from config', () => {
      element.config = { sensor_layout: 'compact' } as any as Config;
      element.hass = mockHass;

      expect(element['layout']).to.equal('compact');
    });

    it('should default layout when not specified', () => {
      element.config = {} as Config;
      element.hass = mockHass;

      expect(element['layout']).to.equal('default');
    });
  });

  describe('render', () => {
    it('should render nothing when hass is not set', () => {
      element['_hass'] = undefined as any;
      expect(element.render()).to.equal(nothing);
    });

    it('should render nothing when hide_climate_label is enabled', () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_climate_label')
        .returns(true);
      element.hass = mockHass;

      expect(element.render()).to.equal(nothing);
    });
  });

  describe('renderSensor', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should render single averaged sensor correctly', async () => {
      const sensor = element.sensors.averaged[0];
      const el = await fixture(element['renderSensor'](sensor, true));

      expect(el.classList.contains('single-averaged')).to.be.true;
      expect(stateDisplayStub.called).to.be.true;
    });

    it('should render multi averaged sensor correctly', async () => {
      const sensor = {
        domain: 'sensor',
        device_class: 'temperature',
        states: [
          { entity_id: 'sensor.temp1', state: '20' },
          { entity_id: 'sensor.temp2', state: '22' },
        ],
      };

      const el = await fixture(element['renderSensor'](sensor, true));

      expect(el.classList.contains('multi-averaged')).to.be.true;
      expect(sensorDataToDisplayStub.called).to.be.true;
    });

    it('should render individual sensor with configured class', async () => {
      const sensor = element.sensors.individual[0];
      const el = await fixture(element['renderSensor'](sensor, false));

      expect(el.classList.contains('configured')).to.be.true;
      expect(stateDisplayStub.called).to.be.true;
    });

    it('should call stylesToHostCss with config styles', async () => {
      const stylesToHostCssStub = stub(
        styleConverterModule,
        'stylesToHostCss',
      ).returns(
        html`<style>
          :host {
            color: red;
          }
        </style>`,
      );
      element.config = {
        styles: { sensors: { 'font-size': '14px' } },
      } as any as Config;
      element.hass = mockHass;

      await fixture(element.render() as TemplateResult);

      // Verify stylesToHostCss is called with config.styles.sensors
      expect(stylesToHostCssStub.calledWith({ 'font-size': '14px' })).to.be
        .true;
    });
  });

  describe('icon rendering', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should hide icons when hide_sensor_icons is enabled', () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_icons')
        .returns(true);
      element.hass = mockHass;

      expect(element['renderStateIcon']({})).to.equal(nothing);
    });

    it('should render state icon when not hidden', async () => {
      const state = { entity_id: 'sensor.test', state: '20' };
      const el = await fixture(
        element['renderStateIcon'](state) as TemplateResult,
      );

      expect(el.tagName).to.equal('HA-STATE-ICON');
    });

    it('should handle icon resources for multi sensors', () => {
      const mockResources = {
        resources: {
          sensor: {
            temperature: { default: 'mdi:thermometer' },
          },
        },
      };
      getIconResourcesStub.resolves(mockResources);

      const sensor = element.sensors.averaged[0]!;
      sensor.states = [
        { entity_id: 'sensor.temp1' },
        { entity_id: 'sensor.temp2' },
      ] as EntityState[];

      element['renderMultiIcon'](sensor);
      expect(getIconResourcesStub.calledWith(mockHass)).to.be.true;
    });
  });
});
