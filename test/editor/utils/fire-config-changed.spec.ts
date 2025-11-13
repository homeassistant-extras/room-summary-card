import { cleanAndFireConfigChanged } from '@editor/utils/fire-config-changed';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('fire-config-changed.ts', () => {
  let fireEventStub: sinon.SinonStub;
  let mockElement: HTMLElement;

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');
    mockElement = document.createElement('div');
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  describe('cleanAndFireConfigChanged', () => {
    it('should return early if config is null', () => {
      cleanAndFireConfigChanged(mockElement, null as any);
      expect(fireEventStub.called).to.be.false;
    });

    it('should return early if config is undefined', () => {
      cleanAndFireConfigChanged(mockElement, undefined as any);
      expect(fireEventStub.called).to.be.false;
    });

    it('should fire config-changed event with cleaned config', () => {
      const config: Config = {
        area: 'living_room',
        features: ['hide_climate_label'],
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(mockElement);
      expect(fireEventStub.firstCall.args[1]).to.equal('config-changed');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({ config });
    });

    it('should remove sensor_layout when set to default', () => {
      const config: Config = {
        area: 'living_room',
        sensor_layout: 'default',
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.sensor_layout).to.be.undefined;
    });

    it('should remove entity when set to undefined', () => {
      const config: Config = {
        area: 'living_room',
        entity: undefined,
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.entity).to.be.undefined;
    });

    it('should remove empty arrays', () => {
      const config: Config = {
        area: 'living_room',
        features: [],
        entities: [],
        lights: [],
        problem_entities: [],
        sensor_classes: [],
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.features).to.be.undefined;
      expect(firedConfig.entities).to.be.undefined;
      expect(firedConfig.lights).to.be.undefined;
      expect(firedConfig.problem_entities).to.be.undefined;
      expect(firedConfig.sensor_classes).to.be.undefined;
    });

    it('should keep non-empty arrays', () => {
      const config: Config = {
        area: 'living_room',
        features: ['hide_climate_label'],
        entities: ['light.test'],
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.features).to.deep.equal(['hide_climate_label']);
      expect(firedConfig.entities).to.deep.equal(['light.test']);
    });

    it('should clean empty nested objects', () => {
      const config: Config = {
        area: 'living_room',
        background: {},
        thresholds: {},
        occupancy: {
          entities: [],
        },
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.background).to.be.undefined;
      expect(firedConfig.thresholds).to.be.undefined;
      expect(firedConfig.occupancy).to.be.undefined;
    });

    it('should keep non-empty nested objects', () => {
      const config: Config = {
        area: 'living_room',
        background: {
          image: 'test.jpg',
        },
        occupancy: {
          entities: ['binary_sensor.motion'],
        },
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.background).to.deep.equal({ image: 'test.jpg' });
      expect(firedConfig.occupancy).to.deep.equal({
        entities: ['binary_sensor.motion'],
      });
    });

    it('should clean nested empty arrays within objects', () => {
      const config: Config = {
        area: 'living_room',
        occupancy: {
          entities: [],
          options: [],
        },
      };

      cleanAndFireConfigChanged(mockElement, config);

      expect(fireEventStub.calledOnce).to.be.true;
      const firedConfig = fireEventStub.firstCall.args[2].config;
      expect(firedConfig.occupancy).to.be.undefined;
    });
  });
});
