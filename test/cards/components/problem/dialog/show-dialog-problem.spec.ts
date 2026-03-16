import { showProblemDialog } from '@cards/components/problem/dialog/show-dialog-problem';
import * as fireEventModule from '@hass/common/dom/fire_event';
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
    const entities: string[] = [
      'binary_sensor.problem1',
      'binary_sensor.problem2',
    ];

    showProblemDialog(element, { entities, config: {} as any });

    expect(fireEventStub.calledOnce).to.be.true;
    expect(fireEventStub.firstCall.args[0]).to.equal(element);
    expect(fireEventStub.firstCall.args[1]).to.equal('show-dialog');
    expect(fireEventStub.firstCall.args[2].dialogTag).to.equal(
      'problem-dialog',
    );
    expect(fireEventStub.firstCall.args[2].dialogParams).to.deep.equal({
      config: {},
      entities,
    });
    expect(fireEventStub.firstCall.args[2].dialogImport).to.be.a('function');
  });

  it('should not fire event when entities array is empty', () => {
    showProblemDialog(element, { entities: [], config: {} as any });

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
