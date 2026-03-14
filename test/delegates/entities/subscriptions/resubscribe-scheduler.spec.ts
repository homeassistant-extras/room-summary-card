import { ResubscribeScheduler } from '@delegates/entities/subscriptions';
import { expect } from 'chai';
import { useFakeTimers } from 'sinon';

describe('ResubscribeScheduler', () => {
  it('runs callback after debounce delay', () => {
    const clock = useFakeTimers();
    const scheduler = new ResubscribeScheduler();
    let called = false;
    scheduler.schedule(() => {
      called = true;
    });
    expect(called).to.be.false;
    clock.tick(50);
    expect(called).to.be.true;
    clock.restore();
  });

  it('debounces: rapid schedule() calls run fn only once', () => {
    const clock = useFakeTimers();
    const scheduler = new ResubscribeScheduler();
    let count = 0;
    scheduler.schedule(() => count++);
    scheduler.schedule(() => count++);
    scheduler.schedule(() => count++);
    clock.tick(50);
    expect(count).to.equal(1);
    clock.restore();
  });

  it('cancel() prevents callback from firing', () => {
    const clock = useFakeTimers();
    const scheduler = new ResubscribeScheduler();
    let called = false;
    scheduler.schedule(() => {
      called = true;
    });
    scheduler.cancel();
    clock.tick(50);
    expect(called).to.be.false;
    clock.restore();
  });
});
