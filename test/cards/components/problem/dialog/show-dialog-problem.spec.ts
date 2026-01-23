import { showProblemDialog } from '@cards/components/problem/dialog/show-dialog-problem';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { EntityState } from '@type/room';
import { expect } from 'chai';
import { restore, stub, type SinonStub } from 'sinon';

describe('show-dialog-problem.ts', () => {
  let fireEventStub: SinonStub;
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    fireEventStub = stub(fireEventModule, 'fireEvent');
  });

  afterEach(() => {
    restore();
  });

  it('should fire show-dialog event with correct parameters when entities are provided', () => {
    const entities: EntityState[] = [
      {
        entity_id: 'binary_sensor.problem1',
        state: 'on',
        attributes: {},
        domain: 'binary_sensor',
      },
      {
        entity_id: 'binary_sensor.problem2',
        state: 'on',
        attributes: {},
        domain: 'binary_sensor',
      },
    ];

    showProblemDialog(element, { entities });

    expect(fireEventStub.calledOnce).to.be.true;
    expect(fireEventStub.firstCall.args[0]).to.equal(element);
    expect(fireEventStub.firstCall.args[1]).to.equal('show-dialog');
    expect(fireEventStub.firstCall.args[2].dialogTag).to.equal(
      'problem-dialog',
    );
    expect(fireEventStub.firstCall.args[2].dialogParams).to.deep.equal({
      entities,
    });
    expect(fireEventStub.firstCall.args[2].dialogImport).to.be.a('function');
  });

  it('should not fire event when entities array is empty', () => {
    showProblemDialog(element, { entities: [] });

    expect(fireEventStub.called).to.be.false;
  });

  it('should not fire event when entities is null or undefined', () => {
    // @ts-ignore - Testing null case
    showProblemDialog(element, null);
    expect(fireEventStub.called).to.be.false;

    // @ts-ignore - Testing undefined case
    showProblemDialog(element, undefined);
    expect(fireEventStub.called).to.be.false;
  });
});
