import { ProblemEntityRow } from '@cards/components/problem/row/problem-entity-row';
import * as fireEventModule from '@homeassistant-extras/hass/common/dom/fire_event';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { fixture } from '@open-wc/testing-helpers';
import { createStateEntity } from '@test/test-helpers';
import { expect } from 'chai';
import { nothing } from 'lit';
import { stub, type SinonStub } from 'sinon';

describe('problem-entity-row.ts', () => {
  let element: ProblemEntityRow;
  let mockHass: HomeAssistant;
  let fireEventStub: SinonStub;

  const mockActiveEntity = createStateEntity(
    'binary_sensor',
    'problem1',
    'on',
    {},
  );
  const mockInactiveEntity = createStateEntity(
    'binary_sensor',
    'problem2',
    'off',
    {},
  );

  beforeEach(() => {
    fireEventStub = stub(fireEventModule, 'fireEvent');

    mockHass = {
      localize: (key: string) => key,
      language: 'en',
      entities: {
        'binary_sensor.problem1': {
          entity_id: 'binary_sensor.problem1',
          name: 'Problem 1',
          device_id: null,
          area_id: null,
          labels: [],
        },
        'binary_sensor.problem2': {
          entity_id: 'binary_sensor.problem2',
          name: 'Problem 2',
          device_id: null,
          area_id: null,
          labels: [],
        },
      },
      devices: {},
    } as any as HomeAssistant;

    element = new ProblemEntityRow();
    element.hass = mockHass;
  });

  afterEach(() => {
    fireEventStub.restore();
  });

  /**
   * Drive the element's subscribed state. `state` is a getter over the
   * reactive `states` map (keyed by entity_id), so point `entity` at the
   * state and register it in the map.
   */
  function setRowState(state: ReturnType<typeof createStateEntity>): void {
    element['entity'] = state.entity_id;
    element['states'] = { [state.entity_id]: state };
  }

  describe('render', () => {
    it('should return nothing when state is not set', () => {
      element.hass = mockHass;
      // state is not set — mixin has not delivered a subscription update yet

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should return nothing when hass is not set', () => {
      element.hass = undefined as any;
      setRowState(mockActiveEntity);

      const result = element.render();
      expect(result).to.equal(nothing);
    });

    it('should render with active class when entity is active', async () => {
      element.hass = mockHass;
      setRowState(mockActiveEntity);

      const result = element.render();
      const el = await fixture(result as any);

      expect(el.classList.contains('problem-entity-row')).to.be.true;
      expect(el.classList.contains('active')).to.be.true;
    });

    it('should render with inactive class when entity is inactive', async () => {
      element.hass = mockHass;
      setRowState(mockInactiveEntity);

      const result = element.render();
      const el = await fixture(result as any);

      expect(el.classList.contains('problem-entity-row')).to.be.true;
      expect(el.classList.contains('inactive')).to.be.true;
    });
  });

  describe('_handleClick', () => {
    it('should fire hass-more-info event with entity id', () => {
      element.hass = mockHass;
      setRowState(mockActiveEntity);
      element['_handleClick']();

      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('hass-more-info');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        entityId: 'binary_sensor.problem1',
      });
    });
  });
});
