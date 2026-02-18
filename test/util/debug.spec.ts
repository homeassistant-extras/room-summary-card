import type { Config } from '@type/config';
import { expect } from 'chai';
import { stub } from 'sinon';
import { d } from '../../src/util/debug';

describe('debug.ts', () => {
  it('should log when config.debug exists', () => {
    const config: Config = { area: '', debug: {} } as Config;
    const consoleDebugStub = stub(console, 'debug');

    d(config, 'room-summary-card', 'render', 'extra');

    expect(consoleDebugStub.calledOnce).to.be.true;
    expect(consoleDebugStub.calledWith('[room-summary-card] render', 'extra'))
      .to.be.true;
    consoleDebugStub.restore();
  });

  it('should not log when config.debug is absent', () => {
    const config: Config = { area: '' } as Config;
    const consoleDebugStub = stub(console, 'debug');

    d(config, 'room-summary-card', 'render');

    expect(consoleDebugStub.notCalled).to.be.true;
    consoleDebugStub.restore();
  });

  it('should not log when config is undefined', () => {
    const consoleDebugStub = stub(console, 'debug');

    d(undefined, 'room-summary-card', 'render');

    expect(consoleDebugStub.notCalled).to.be.true;
    consoleDebugStub.restore();
  });

  it('should filter by scope when scope is set', () => {
    const config: Config = {
      area: '',
      debug: { scope: ['room-summary-card'] },
    } as Config;
    const consoleDebugStub = stub(console, 'debug');

    d(config, 'room-summary-card', 'render');
    expect(consoleDebugStub.calledOnce).to.be.true;

    consoleDebugStub.resetHistory();
    d(config, 'entity-collection', 'render');
    expect(consoleDebugStub.notCalled).to.be.true;

    consoleDebugStub.restore();
  });

  it('should filter by categories when categories is set', () => {
    const config: Config = {
      area: '',
      debug: { categories: ['render'] },
    } as Config;
    const consoleDebugStub = stub(console, 'debug');

    d(config, 'room-summary-card', 'render');
    expect(consoleDebugStub.calledOnce).to.be.true;

    consoleDebugStub.resetHistory();
    d(config, 'room-summary-card', 'set hass');
    expect(consoleDebugStub.notCalled).to.be.true;

    consoleDebugStub.restore();
  });

  it('should require both scope and category when both are set', () => {
    const config: Config = {
      area: '',
      debug: { scope: ['room-summary-card'], categories: ['render'] },
    } as Config;
    const consoleDebugStub = stub(console, 'debug');

    d(config, 'room-summary-card', 'render');
    expect(consoleDebugStub.calledOnce).to.be.true;

    consoleDebugStub.resetHistory();
    d(config, 'entity-collection', 'render');
    expect(consoleDebugStub.notCalled).to.be.true;

    consoleDebugStub.resetHistory();
    d(config, 'room-summary-card', 'set hass');
    expect(consoleDebugStub.notCalled).to.be.true;

    consoleDebugStub.restore();
  });
});
