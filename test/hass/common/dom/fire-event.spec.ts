import { fireEvent } from '@hass/common/dom/fire_event';
import type { ConfigChangedEvent } from '@hass/panels/lovelace/editor/hui-element-editor';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('fire-event.ts', () => {
  let element: HTMLElement;
  let dispatchStub: sinon.SinonStub;
  let windowStub: sinon.SinonStub;

  beforeEach(() => {
    // Create a fresh element before each test
    element = document.createElement('div');
    dispatchStub = stub(element, 'dispatchEvent');
    windowStub = stub(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchStub.restore();
    windowStub.restore();
  });

  it('should create and dispatch a custom event with detail', () => {
    // @ts-ignore
    fireEvent(element, 'hass-action', {
      config: { entity: 'light.test' },
      action: 'hold',
    });

    // Ensure the stub was called once
    expect(dispatchStub.calledOnce).to.be.true;

    // Retrieve the event argument passed to dispatchEvent
    const event = dispatchStub.firstCall.args[0] as Event;
    // @ts-ignore
    expect(event.type).to.equal('hass-action');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // @ts-ignore - Access detail property that was added manually
    expect(event.detail.action).to.equal('hold');
    // @ts-ignore
    expect(event.detail.config.entity).to.equal('light.test');
  });

  it('should create and dispatch a custom event with no detail', () => {
    // @ts-ignore
    fireEvent(element, 'hass-action');

    // Ensure the stub was called once
    expect(dispatchStub.calledOnce).to.be.true;

    // Retrieve the event argument passed to dispatchEvent
    const event = dispatchStub.firstCall.args[0] as Event;
    // @ts-ignore
    expect(event.type).to.equal('hass-action');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // @ts-ignore - The detail property is now an empty object, not null
    expect(event.detail).to.deep.equal({});
  });

  it('should work with config-changed events', () => {
    const configDetail: ConfigChangedEvent = {
      config: { area: 'test-area' },
    };

    const event = fireEvent(element, 'config-changed', configDetail) as Event;

    // Ensure the stub was called once
    expect(dispatchStub.calledOnce).to.be.true;

    // @ts-ignore - Access detail property
    expect(event.detail.config).to.deep.equal(configDetail.config);
  });

  it('should work with Window as target', () => {
    // @ts-ignore
    fireEvent(window, 'hass-action');

    // Ensure the stub was called once
    expect(windowStub.calledOnce).to.be.true;

    // Retrieve the event argument passed to dispatchEvent
    const event = windowStub.firstCall.args[0] as Event;
    // @ts-ignore
    expect(event.type).to.equal('hass-action');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    // @ts-ignore - The detail property is now an empty object, not null
    expect(event.detail).to.deep.equal({});
  });

  it('should return the fired event', () => {
    // @ts-ignore
    const event = fireEvent(element, 'hass-action');

    expect(event).to.be.instanceOf(Event);
    // @ts-ignore
    expect(event.type).to.equal('hass-action');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });
});
