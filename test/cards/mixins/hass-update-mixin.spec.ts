import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { LitElement } from 'lit';

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
});
