import { LabelTemplateConnection } from '@delegates/label-template-connection';
import * as computeEntityNameModule from '@homeassistant-extras/hass/common/entity/compute_entity_name';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import {
  renderConfiguredEntityLabel,
  renderEntityLabel,
  renderSensorLabel,
} from '@html/render-label';
import * as stateDisplayModule from '@html/state-display';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import * as thresholdColorModule from '@theme/threshold-color';
import type { Config } from '@type/config';
import type { EntityInformation } from '@type/room';
import type { AveragedSensor } from '@type/sensor';
import { expect } from 'chai';
import { html, nothing } from 'lit';
import { stub } from 'sinon';

describe('render-label.ts', () => {
  let getThresholdResultStub: sinon.SinonStub;
  let getEntityLabelStub: sinon.SinonStub;
  let stateDisplayStub: sinon.SinonStub;
  let computeEntityNameStub: sinon.SinonStub;

  const state = createStateEntity('light', 'living_room', 'on', {
    friendly_name: 'Living Room Light',
  });

  const baseEntity: EntityInformation = {
    config: { entity_id: 'light.living_room' },
    state,
  };

  const hass = {
    states: { 'light.living_room': state },
    formatEntityState: () => 'on',
    connection: {},
  } as any as HomeAssistant;

  const averagedSensor: AveragedSensor = {
    domain: 'sensor',
    device_class: 'temperature',
    states: [state],
    average: 21,
    uom: '°C',
  };

  describe('renderSensorLabel', () => {
    const config = { area: 'living_room' } as Config;

    it('renders room-sensor-label with entity when labels are shown', async () => {
      const el = await fixture(
        html`<div>
          ${renderSensorLabel(hass, config, { entity: baseEntity })}
        </div>`,
      );

      const label = el.querySelector('room-sensor-label');
      expect(label).to.exist;
      expect((label as any).entity).to.equal(baseEntity);
      expect((label as any).hass).to.equal(hass);
    });

    it('renders room-sensor-label with sensor for averaged rows', async () => {
      const el = await fixture(
        html`<div>
          ${renderSensorLabel(hass, config, { sensor: averagedSensor })}
        </div>`,
      );

      const label = el.querySelector('room-sensor-label');
      expect(label).to.exist;
      expect((label as any).sensor).to.equal(averagedSensor);
    });

    it('returns nothing when hide_sensor_labels is enabled', () => {
      const result = renderSensorLabel(
        hass,
        { area: 'living_room', features: ['hide_sensor_labels'] },
        { entity: baseEntity },
      );

      expect(result).to.equal(nothing);
    });
  });

  describe('renderEntityLabel', () => {
    const config = {
      area: 'living_room',
      features: ['show_entity_labels'],
    } as Config;

    it('renders room-entity-label when entity labels are enabled', async () => {
      const el = await fixture(
        html`<div>${renderEntityLabel(hass, config, baseEntity, false)}</div>`,
      );

      const label = el.querySelector('room-entity-label');
      expect(label).to.exist;
      expect((label as any).entity).to.equal(baseEntity);
      expect((label as any).hass).to.equal(hass);
    });

    it('returns nothing when entity labels are disabled', () => {
      const result = renderEntityLabel(
        hass,
        { area: 'living_room' },
        baseEntity,
        false,
      );

      expect(result).to.equal(nothing);
    });

    it('returns nothing for the main room entity when hide_icon_only is enabled', () => {
      const hideIconConfig = {
        ...config,
        background: { options: ['hide_icon_only'] },
      } as Config;

      const result = renderEntityLabel(hass, hideIconConfig, baseEntity, true);

      expect(result).to.equal(nothing);
    });
  });

  let conn: LabelTemplateConnection;

  beforeEach(() => {
    conn = new LabelTemplateConnection(() => {});

    getThresholdResultStub = stub(thresholdColorModule, 'getThresholdResult');
    getEntityLabelStub = stub(thresholdColorModule, 'getEntityLabel');
    stateDisplayStub = stub(stateDisplayModule, 'stateDisplay').returns(
      html`<span class="state-display">state-display</span>`,
    );
    computeEntityNameStub = stub(
      computeEntityNameModule,
      'computeEntityName',
    ).returns('Living Room Light');
  });

  afterEach(() => {
    getThresholdResultStub.restore();
    getEntityLabelStub.restore();
    stateDisplayStub.restore();
    computeEntityNameStub.restore();
  });

  describe('label priority order', () => {
    it('prioritizes threshold label over config label', async () => {
      getThresholdResultStub.returns({ label: 'Threshold Label' });
      getEntityLabelStub.returns('Threshold Label');

      const entity: EntityInformation = {
        ...baseEntity,
        config: { entity_id: 'light.living_room', label: 'Config Label' },
      };

      const el = await fixture(
        html`<div>
          ${renderConfiguredEntityLabel(hass, entity, conn, 'entity-name')}
        </div>`,
      );

      expect(el.textContent?.trim()).to.equal('Threshold Label');
      expect(
        getEntityLabelStub.calledWith(entity, { label: 'Threshold Label' }),
      ).to.be.true;
    });

    it('uses config label when no threshold label is present', async () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns('Config Label');

      const entity: EntityInformation = {
        ...baseEntity,
        config: { entity_id: 'light.living_room', label: 'Config Label' },
      };

      const el = await fixture(
        html`<div>
          ${renderConfiguredEntityLabel(hass, entity, conn, 'entity-name')}
        </div>`,
      );

      expect(el.textContent?.trim()).to.equal('Config Label');
      expect(stateDisplayStub.called).to.be.false;
      expect(computeEntityNameStub.called).to.be.false;
    });

    it('falls back to attribute state-display when no label and attribute is configured', async () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns(undefined);

      const entity: EntityInformation = {
        ...baseEntity,
        config: { entity_id: 'light.living_room', attribute: 'brightness' },
      };

      await fixture(
        html`<div>
          ${renderConfiguredEntityLabel(hass, entity, conn, 'entity-name')}
        </div>`,
      );

      expect(stateDisplayStub.calledWith(hass, state, 'brightness')).to.be.true;
      expect(computeEntityNameStub.called).to.be.false;
    });

    it('falls back to state-display when fallback is "state-display" (sensor row)', async () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns(undefined);

      await fixture(
        html`<div>
          ${renderConfiguredEntityLabel(
            hass,
            baseEntity,
            conn,
            'state-display',
          )}
        </div>`,
      );

      expect(stateDisplayStub.calledWith(hass, state, undefined)).to.be.true;
      expect(computeEntityNameStub.called).to.be.false;
    });

    it('falls back to entity name when no label/attribute and fallback is "entity-name"', async () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns(undefined);

      const el = await fixture(
        html`<div>
          ${renderConfiguredEntityLabel(hass, baseEntity, conn, 'entity-name')}
        </div>`,
      );

      expect(el.textContent?.trim()).to.equal('Living Room Light');
      expect(computeEntityNameStub.calledWith(state, hass)).to.be.true;
      expect(stateDisplayStub.called).to.be.false;
    });

    it('returns nothing when state is missing and no label resolved', () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns(undefined);

      const entity: EntityInformation = {
        config: { entity_id: 'light.living_room' },
        state: undefined,
      };

      const result = renderConfiguredEntityLabel(
        hass,
        entity,
        conn,
        'entity-name',
      );
      expect(result).to.equal(nothing);
    });
  });

  describe('template label (Jinja)', () => {
    it('syncs the template subscription and renders rendered text when available', () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns('{{ states("sensor.x") }}');

      const syncStub = stub(conn, 'sync').callsFake(function (
        this: LabelTemplateConnection,
      ) {
        (this as any)._displayedText = 'rendered';
      });
      // emulate displayedText getter via Object.defineProperty
      Object.defineProperty(conn, 'displayedText', {
        get: () => 'rendered',
        configurable: true,
      });

      const result = renderConfiguredEntityLabel(
        hass,
        baseEntity,
        conn,
        'entity-name',
      );

      expect(
        syncStub.calledWith(
          hass,
          'light.living_room',
          '{{ states("sensor.x") }}',
        ),
      ).to.be.true;
      expect(result).to.not.equal(nothing);
      syncStub.restore();
    });

    it('disconnects the template subscription when label is plain text', () => {
      getThresholdResultStub.returns(undefined);
      getEntityLabelStub.returns('Plain Label');

      const disconnectStub = stub(conn, 'disconnect');

      renderConfiguredEntityLabel(hass, baseEntity, conn, 'entity-name');

      expect(disconnectStub.called).to.be.true;
      disconnectStub.restore();
    });
  });
});
