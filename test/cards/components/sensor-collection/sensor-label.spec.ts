import { RoomSensorLabel } from '@cards/components/sensor-collection/sensor-label';
import * as featureModule from '@config/feature';
import * as sensorUtilsModule from '@delegates/utils/sensor-utils';
import type { HomeAssistant } from '@hass/types';
import * as renderLabelModule from '@html/render-label';
import { createStateEntityForEntityId as s } from '@test/test-helpers';
import type { EntityInformation } from '@type/room';
import type { AveragedSensor } from '@type/sensor';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('sensor-label.ts', () => {
  let element: RoomSensorLabel;
  let mockHass: HomeAssistant;
  let mockEntity: EntityInformation;
  let mockSensor: AveragedSensor;
  let hasFeatureStub: sinon.SinonStub;
  let sensorDataToDisplaySensorsStub: sinon.SinonStub;
  let renderConfiguredEntityLabelStub: sinon.SinonStub;

  beforeEach(() => {
    const state = s('sensor.temperature', '21', {
      unit_of_measurement: '°C',
    });

    mockHass = {
      states: {
        'sensor.temperature': state,
      },
      formatEntityState: () => '21 °C',
    } as any as HomeAssistant;

    mockEntity = {
      config: { entity_id: 'sensor.temperature' },
      state,
    };

    mockSensor = {
      domain: 'sensor',
      device_class: 'temperature',
      states: [state],
      average: 21,
      uom: '°C',
    };

    hasFeatureStub = stub(featureModule, 'hasFeature').returns(false);
    sensorDataToDisplaySensorsStub = stub(
      sensorUtilsModule,
      'sensorDataToDisplaySensors',
    ).returns('21°C');
    renderConfiguredEntityLabelStub = stub(
      renderLabelModule,
      'renderConfiguredEntityLabel',
    ).returns(html`<span>21 °C</span>`);

    element = new RoomSensorLabel();
    element.hass = mockHass;
    element.config = { area: 'living_room' };
    element.entity = mockEntity;
  });

  afterEach(() => {
    hasFeatureStub.restore();
    sensorDataToDisplaySensorsStub.restore();
    renderConfiguredEntityLabelStub.restore();
  });

  describe('show', () => {
    it('returns true when sensor labels are not hidden', () => {
      expect(element.show).to.be.true;
      expect(hasFeatureStub.calledWith(element.config, 'hide_sensor_labels')).to
        .be.true;
    });

    it('returns false when hide_sensor_labels is enabled', () => {
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(true);

      expect(element.show).to.be.false;
    });
  });

  describe('render', () => {
    it('renders averaged sensor display text before entity labels', () => {
      element.sensor = mockSensor;

      const result = element.render();

      expect(result).to.not.equal(nothing);
      expect(sensorDataToDisplaySensorsStub.calledWith(mockSensor)).to.be.true;
      expect(renderConfiguredEntityLabelStub.called).to.be.false;
    });

    it('delegates entity labels to the shared label renderer', () => {
      const result = element.render();

      expect(result).to.not.equal(nothing);
      expect(
        renderConfiguredEntityLabelStub.calledWith(
          mockHass,
          mockEntity,
          element['_labelTemplateConn'],
          'state-display',
        ),
      ).to.be.true;
    });

    it('returns nothing when hidden and disconnects templates', () => {
      const disconnectStub = stub(element['_labelTemplateConn'], 'disconnect');
      hasFeatureStub
        .withArgs(element.config, 'hide_sensor_labels')
        .returns(true);

      const result = element.render();

      expect(result).to.equal(nothing);
      expect(disconnectStub.calledOnce).to.be.true;
      expect(sensorDataToDisplaySensorsStub.called).to.be.false;
      expect(renderConfiguredEntityLabelStub.called).to.be.false;

      disconnectStub.restore();
    });

    it('returns nothing when neither sensor nor entity is set', () => {
      element.entity = undefined;

      expect(element.render()).to.equal(nothing);
      expect(sensorDataToDisplaySensorsStub.called).to.be.false;
      expect(renderConfiguredEntityLabelStub.called).to.be.false;
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
