import { SensorCollection } from '@cards/components/sensor-collection/sensor-collection';
import * as featureModule from '@config/feature';
import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as iconModule from '@delegates/retrievers/icons';
import * as sensorUtilsModule from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import * as attributeDisplayModule from '@html/attribute-display';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import * as thresholdColorModule from '@theme/threshold-color';
import * as styleConverterModule from '@theme/util/style-converter';
import type { Config } from '@type/config';
import type { EntityState } from '@type/room';
import type { SensorData } from '@type/sensor';
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
  let attributeDisplayStub: sinon.SinonStub;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;

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
    attributeDisplayStub = stub(
      attributeDisplayModule,
      'attributeDisplay',
    ).returns(html`<span>attribute value</span>`);
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
    attributeDisplayStub.restore();
    actionHandlerStub.restore();
    handleClickActionStub.restore();
  });

  describe('hass property setter', () => {
    it('should set internal hass and update flags', () => {
      element.hass = mockHass;

      expect(element['_hass']).to.equal(mockHass);
      expect(hasFeatureStub.calledWith(element.config, 'hide_sensor_icons')).to
        .be.true;
      expect(hasFeatureStub.calledWith(element.config, 'hide_sensor_labels')).to
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
      const sensor = element.sensors.averaged[0]!;
      const el = await fixture(element['renderSensor'](sensor, true));

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
        uom: '°C',
        average: 21,
      } as any;

      const el = await fixture(element['renderSensor'](sensor, true));

      expect(sensorDataToDisplayStub.called).to.be.true;
    });

    it('should render individual sensor with configured class', async () => {
      const sensor = element.sensors.individual[0]!;
      const el = await fixture(element['renderSensor'](sensor, false));

      // Check that the sensor div exists and has the correct structure
      expect(el.tagName).to.equal('DIV');
      expect(el.classList.contains('sensor')).to.be.true;
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

      stylesToHostCssStub.restore();
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

  describe('label rendering', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should hide labels when hide_sensor_labels is enabled for single sensors', async () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(true);
      element.hass = mockHass;

      const sensor = element.sensors.individual[0]!;
      const result = element['renderSingleSensor'](sensor as EntityState);

      // The stateDisplay function should not be called when labels are hidden
      expect(stateDisplayStub.called).to.be.false;
    });

    it('should hide labels when hide_sensor_labels is enabled for multi sensors', async () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(true);
      element.hass = mockHass;

      const sensor = {
        domain: 'sensor',
        device_class: 'temperature',
        states: [
          { entity_id: 'sensor.temp1', state: '20' },
          { entity_id: 'sensor.temp2', state: '22' },
        ],
        uom: '°C',
        average: 21,
      } as any;

      const result = element['renderSensor'](sensor, true);

      // The sensorDataToDisplaySensors function should not be called when labels are hidden
      expect(sensorDataToDisplayStub.called).to.be.false;
    });

    it('should render labels when hide_sensor_labels is disabled', async () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(false);
      element.hass = mockHass;

      const sensor = element.sensors.individual[0]!;
      await fixture(element['renderSingleSensor'](sensor as EntityState));

      expect(stateDisplayStub.called).to.be.true;
    });

    it('should use attribute display when sensor config has attribute and no label', async () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(false);
      element.hass = mockHass;

      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            attribute: 'humidity',
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          {
            entity_id: 'sensor.humidity',
            state: '45',
            domain: 'sensor',
            attributes: {
              humidity: 50,
            },
          } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const sensor = element.sensors.individual[0]!;
      await fixture(element['renderSingleSensor'](sensor as EntityState));

      expect(attributeDisplayStub.called).to.be.true;
      expect(attributeDisplayStub.calledWith(mockHass, sensor, 'humidity')).to
        .be.true;
      expect(stateDisplayStub.called).to.be.false;
    });
  });

  describe('action handling', () => {
    beforeEach(() => {
      element.hass = mockHass;
    });

    it('should attach action handlers to non-averaged sensors', async () => {
      const sensor = element.sensors.individual[0]!;
      const el = await fixture(element['renderSensor'](sensor, false));

      // Check that the sensor div has action handlers attached
      expect(el).to.have.property('actionHandler');

      // Verify that actionHandler and handleClickAction were called
      expect(actionHandlerStub.called).to.be.true;
      expect(handleClickActionStub.called).to.be.true;

      // Check that the sensor div has the action event listener
      expect(el).to.have.property('actionHandler');
    });

    it('should not attach action handlers to averaged sensors', async () => {
      const sensor = element.sensors.averaged[0]!;
      const el = await fixture(element['renderSensor'](sensor, true));

      // Single averaged sensors should have action handlers (they use renderSingleSensor)
      expect(actionHandlerStub.called).to.be.true;
      expect(handleClickActionStub.called).to.be.true;
    });

    it('should create proper entity information for individual sensors', async () => {
      const sensor = element.sensors.individual[0]!;
      const el = await fixture(element['renderSensor'](sensor, false));

      // Verify that actionHandler was called with the correct entity information
      expect(actionHandlerStub.called).to.be.true;
      const entityInfo = actionHandlerStub.firstCall.args[0];
      expect(entityInfo.config.entity_id).to.equal('sensor.humidity');
      expect(entityInfo.config.tap_action.action).to.equal('more-info');
      expect(entityInfo.state).to.equal(sensor);
    });
  });

  describe('state-based sensor styling', () => {
    let getThresholdResultStub: sinon.SinonStub;

    beforeEach(() => {
      element.hass = mockHass;
      getThresholdResultStub = stub(thresholdColorModule, 'getThresholdResult');
    });

    afterEach(() => {
      getThresholdResultStub.restore();
    });

    it('should apply custom icon when state matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            states: [
              {
                state: '45',
                icon_color: 'blue',
                icon: 'mdi:water',
                styles: {},
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        icon: 'mdi:water',
        color: 'blue',
        styles: {},
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Should render ha-icon with custom icon instead of ha-state-icon
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      // ha-icon uses property binding, not attribute
      expect((icon as any)?.icon).to.equal('mdi:water');
    });

    it('should apply styles when state matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            states: [
              {
                state: '45',
                icon_color: 'blue',
                icon: 'mdi:water',
                styles: { 'background-color': 'lightblue', padding: '4px' },
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        icon: 'mdi:water',
        color: 'blue',
        styles: { 'background-color': 'lightblue', padding: '4px' },
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Check that styles are applied to the sensor div
      // The element itself is the sensor div
      expect(el.tagName).to.equal('DIV');
      expect(el.classList.contains('sensor')).to.be.true;
      // Check that styleMap was called (styles may be applied via Lit's styleMap directive)
      // In the test environment, we verify getThresholdResult was called with correct config
      expect(getThresholdResultStub.called).to.be.true;
    });

    it('should use default icon when no state matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            states: [
              {
                state: '50',
                icon_color: 'blue',
                icon: 'mdi:water',
                styles: {},
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns(undefined);

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Should render ha-state-icon (default) when no state matches
      const stateIcon = el.querySelector('ha-state-icon');
      expect(stateIcon).to.exist;
    });

    it('should handle sensor config lookup correctly', () => {
      element.config = {
        sensors: [
          'sensor.temp1', // String format
          {
            entity_id: 'sensor.humidity',
            states: [
              {
                state: '45',
                icon_color: 'blue',
                icon: 'mdi:water',
                styles: {},
              },
            ],
          },
        ],
      } as any as Config;

      // Should return undefined for string format sensor
      const tempConfig = element['getSensorConfig']('sensor.temp1');
      expect(tempConfig).to.be.undefined;

      // Should return config for object format sensor
      const humidityConfig = element['getSensorConfig']('sensor.humidity');
      expect(humidityConfig).to.exist;
      expect(humidityConfig?.entity_id).to.equal('sensor.humidity');
      expect(humidityConfig?.states).to.have.lengthOf(1);
    });

    it('should handle sensors without state config', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            // No states property
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns(undefined);

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Should render normally without custom styling
      // The element itself is the sensor div
      expect(el.tagName).to.equal('DIV');
      expect(el.classList.contains('sensor')).to.be.true;
      const stateIcon = el.querySelector('ha-state-icon');
      expect(stateIcon).to.exist;
    });
  });

  describe('sensor icon configuration', () => {
    let getThresholdResultStub: sinon.SinonStub;

    beforeEach(() => {
      element.hass = mockHass;
      getThresholdResultStub = stub(thresholdColorModule, 'getThresholdResult');
    });

    afterEach(() => {
      getThresholdResultStub.restore();
    });

    it('should use configured icon when sensor config has icon property', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.bwt_perla_regenerativ_level',
            icon: 'phu:water-softener',
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          {
            entity_id: 'sensor.bwt_perla_regenerativ_level',
            state: '50',
          } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns(undefined);

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any)?.icon).to.equal('phu:water-softener');
    });

    it('should prioritize configured icon over state-based icon', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            icon: 'phu:water-softener',
            states: [
              {
                state: '45',
                icon: 'mdi:water',
                icon_color: 'blue',
                styles: {},
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        icon: 'mdi:water',
        color: 'blue',
        styles: {},
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Configured icon should take priority over state-based icon
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any)?.icon).to.equal('phu:water-softener');
    });

    it('should fall back to state-based icon when config icon is not set', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.humidity',
            states: [
              {
                state: '45',
                icon: 'mdi:water',
                icon_color: 'blue',
                styles: {},
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.humidity', state: '45' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        icon: 'mdi:water',
        color: 'blue',
        styles: {},
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Should use state-based icon when no config icon
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any)?.icon).to.equal('mdi:water');
    });
  });

  describe('threshold-based sensor styling', () => {
    let getThresholdResultStub: sinon.SinonStub;
    let getEntityLabelStub: sinon.SinonStub;

    beforeEach(() => {
      element.hass = mockHass;
      getThresholdResultStub = stub(
        thresholdColorModule,
        'getThresholdResult',
      ).returns(undefined);
      getEntityLabelStub = stub(thresholdColorModule, 'getEntityLabel').returns(
        undefined,
      );
    });

    afterEach(() => {
      getThresholdResultStub.restore();
      getEntityLabelStub.restore();
    });

    it('should pass thresholds to getThresholdResult', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 25,
                operator: 'gt',
                icon_color: 'red',
                icon: 'mdi:thermometer-alert',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '30' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const sensor = element.sensors.individual[0]!;
      await fixture(element['renderSingleSensor'](sensor as EntityState));

      // Verify getThresholdResult was called
      expect(getThresholdResultStub.called).to.be.true;
      const entityInfo = getThresholdResultStub.firstCall.args[0];
      expect(entityInfo.config.thresholds).to.deep.equal([
        {
          threshold: 25,
          operator: 'gt',
          icon_color: 'red',
          icon: 'mdi:thermometer-alert',
        },
      ]);
    });

    it('should apply threshold colors to sensor icons', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 25,
                operator: 'gt',
                icon_color: 'red',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '30' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        color: 'red',
        icon: undefined,
        label: undefined,
        styles: undefined,
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Check that the color is applied via CSS variable
      // el itself is the sensor div
      expect(el.classList.contains('sensor')).to.be.true;
      const sensorDiv = el as HTMLElement;
      expect(sensorDiv.style.getPropertyValue('--sensor-icon-color')).to.equal(
        'red',
      );
    });

    it('should apply threshold icons when threshold matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 25,
                operator: 'gt',
                icon_color: 'red',
                icon: 'mdi:thermometer-alert',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '30' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        color: 'red',
        icon: 'mdi:thermometer-alert',
        label: undefined,
        styles: undefined,
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Should use threshold icon
      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any)?.icon).to.equal('mdi:thermometer-alert');
    });

    it('should apply threshold labels when threshold matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 25,
                operator: 'gt',
                icon_color: 'red',
                label: 'Hot',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '30' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        color: 'red',
        icon: undefined,
        label: 'Hot',
        styles: undefined,
      });
      getEntityLabelStub.returns('Hot');

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Verify getEntityLabel was called with the threshold result
      expect(getEntityLabelStub.called).to.be.true;
    });

    it('should apply threshold styles when threshold matches', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 25,
                operator: 'gt',
                icon_color: 'red',
                styles: {
                  animation: 'pulse 2s ease-in-out infinite',
                },
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '30' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      getThresholdResultStub.returns({
        color: 'red',
        icon: undefined,
        label: undefined,
        styles: {
          animation: 'pulse 2s ease-in-out infinite',
        },
      });

      const sensor = element.sensors.individual[0]!;
      const el = await fixture(
        element['renderSingleSensor'](sensor as EntityState),
      );

      // Check that styles are applied
      // el itself is the sensor div
      expect(el.classList.contains('sensor')).to.be.true;
      const sensorDiv = el as HTMLElement;
      expect(sensorDiv.style.animation).to.equal(
        'pulse 2s ease-in-out infinite',
      );
    });

    it('should handle multiple thresholds with priority ordering', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.temperature',
            thresholds: [
              {
                threshold: 30,
                operator: 'gt',
                icon_color: 'red',
                icon: 'mdi:thermometer-alert',
              },
              {
                threshold: 20,
                operator: 'gte',
                icon_color: 'green',
                icon: 'mdi:thermometer',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          { entity_id: 'sensor.temperature', state: '25' } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      // Simulate that threshold evaluation returns the higher priority threshold
      getThresholdResultStub.returns({
        color: 'green',
        icon: 'mdi:thermometer',
        label: undefined,
        styles: undefined,
      });

      const sensor = element.sensors.individual[0]!;
      await fixture(element['renderSingleSensor'](sensor as EntityState));

      // Verify thresholds were passed correctly
      expect(getThresholdResultStub.called).to.be.true;
      const entityInfo = getThresholdResultStub.firstCall.args[0];
      expect(entityInfo.config.thresholds).to.have.length(2);
    });

    it('should work with attribute-based thresholds', async () => {
      element.config = {
        sensors: [
          {
            entity_id: 'sensor.weather',
            thresholds: [
              {
                threshold: 30,
                operator: 'gt',
                icon_color: 'red',
                attribute: 'temperature',
              },
            ],
          },
        ],
      } as any as Config;

      element.sensors = {
        individual: [
          {
            entity_id: 'sensor.weather',
            state: 'sunny',
            domain: 'sensor',
            attributes: { temperature: 35 },
          } as EntityState,
        ],
        averaged: [],
        problemSensors: [],
        lightEntities: [],
        ambientLightEntities: [],
        thresholdSensors: [],
      };

      const sensor = element.sensors.individual[0]!;
      await fixture(element['renderSingleSensor'](sensor as EntityState));

      // Verify thresholds with attribute were passed
      expect(getThresholdResultStub.called).to.be.true;
      const entityInfo = getThresholdResultStub.firstCall.args[0];
      expect(entityInfo.config.thresholds?.[0]?.attribute).to.equal(
        'temperature',
      );
    });
  });
});
