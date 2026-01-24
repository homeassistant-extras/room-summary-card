import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { LitElement } from 'lit';
import { match, stub } from 'sinon';

describe('HassUpdateMixin', () => {
  let TestElement: ReturnType<typeof HassUpdateMixin>;
  let element: InstanceType<typeof TestElement>;
  let hass: HomeAssistant;
  let elementCounter = 0;

  beforeEach(() => {
    // Create a test element class using the mixin with unique name
    const elementName = `test-hass-update-${elementCounter++}`;
    TestElement = HassUpdateMixin(LitElement);

    // Only define if not already defined
    if (!customElements.get(elementName)) {
      customElements.define(elementName, TestElement);
    }

    element = new TestElement();
    hass = {
      language: 'en',
      localize: (key: string) => key,
    } as HomeAssistant;
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  it('should have hass property', () => {
    expect(element).to.have.property('hass');
    expect(element.hass).to.be.undefined;
  });

  it('should update hass property when set directly', () => {
    element.hass = hass;
    expect(element.hass).to.deep.equal(hass);
  });

  it('should have connectedCallback and disconnectedCallback methods', () => {
    expect(element.connectedCallback).to.be.a('function');
    expect(element.disconnectedCallback).to.be.a('function');
  });

  it('should add event listener when connected to DOM', () => {
    const addEventListenerSpy = stub(globalThis, 'addEventListener');

    // Call connectedCallback directly (it will be called automatically when appended)
    element.connectedCallback();

    expect(addEventListenerSpy.calledWith('hass-update', match.any)).to.be.true;

    addEventListenerSpy.restore();
  });

  it('should remove event listener when disconnected from DOM', () => {
    const removeEventListenerSpy = stub(globalThis, 'removeEventListener');

    // Set up: connect first
    element.connectedCallback();
    // Then disconnect
    element.disconnectedCallback();

    expect(removeEventListenerSpy.calledWith('hass-update', match.any)).to.be
      .true;

    removeEventListenerSpy.restore();
  });

  it('should update hass property when hass-update event is fired', () => {
    // Connect the element to set up the event listener
    element.connectedCallback();

    // Create a custom event that works in jsdom
    const updateEvent = document.createEvent('Event') as CustomEvent<{
      hass: HomeAssistant;
    }>;
    updateEvent.initEvent('hass-update', false, false);
    (updateEvent as any).detail = { hass };
    globalThis.dispatchEvent(updateEvent);

    expect(element.hass).to.deep.equal(hass);
  });
});
