import { HassUpdateMixin } from '@cards/mixins/hass-update-mixin';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { expect } from 'chai';
import { LitElement } from 'lit';

/**
 * The mixin attaches its listener to the result of `getRootNode()` (or
 * `_host.shadowRoot` if set). To test that without JSDOM custom-element
 * upgrade quirks, we construct mixin elements directly and stub
 * `getRootNode` to return a fresh `EventTarget` standing in for the
 * card's shadow root.
 */
describe('HassUpdateMixin', () => {
  type Mixed = LitElement & {
    hass?: HomeAssistant;
    _host?: Element;
  };
  let TestElement: ReturnType<typeof HassUpdateMixin>;
  let elementCounter = 0;
  let hass: HomeAssistant;
  let otherHass: HomeAssistant;

  beforeEach(() => {
    TestElement = HassUpdateMixin(LitElement);
    const elementName = `test-hass-update-${elementCounter++}`;
    if (!customElements.get(elementName)) {
      customElements.define(elementName, TestElement);
    }
    hass = { language: 'en', localize: (k: string) => k } as HomeAssistant;
    otherHass = { language: 'fr', localize: (k: string) => k } as HomeAssistant;
  });

  function attach(rootNode: EventTarget, host?: Element): Mixed {
    const el = new TestElement() as unknown as Mixed;
    (el as any).getRootNode = () => rootNode;
    if (host) el._host = host;
    el.connectedCallback();
    return el;
  }

  function dispatch(target: EventTarget, h: HomeAssistant): void {
    // Use Node's native CustomEvent so Node's EventTarget accepts it.
    target.dispatchEvent(
      new CustomEvent('hass-update', { detail: { hass: h } }),
    );
  }

  it('exposes hass and config properties', () => {
    const el = new TestElement() as unknown as Mixed;
    expect(el).to.have.property('hass');
    expect(el.hass).to.be.undefined;
    el.hass = hass;
    expect(el.hass).to.deep.equal(hass);
  });

  it('attaches listener to its root node on connect', () => {
    const root = new EventTarget();
    const el = attach(root);

    dispatch(root, hass);
    expect(el.hass).to.deep.equal(hass);
  });

  it('isolates sibling cards (different root nodes)', () => {
    const rootA = new EventTarget();
    const rootB = new EventTarget();
    const childA = attach(rootA);
    const childB = attach(rootB);

    dispatch(rootA, hass);
    expect(childA.hass).to.deep.equal(hass);
    expect(childB.hass).to.be.undefined;

    dispatch(rootB, otherHass);
    expect(childB.hass).to.deep.equal(otherHass);
    expect(childA.hass).to.deep.equal(hass);
  });

  it('removes its listener on disconnect', () => {
    const root = new EventTarget();
    const el = attach(root);
    el.disconnectedCallback();

    dispatch(root, hass);
    expect(el.hass).to.be.undefined;
  });

  it('routes through `_host.shadowRoot` for portalled descendants', () => {
    // Stand-in for a card host with a shadow root.
    const cardShadow = new EventTarget();
    const card = { shadowRoot: cardShadow } as unknown as Element;
    // Portal element's own root is somewhere else (e.g. home-assistant-main).
    const otherRoot = new EventTarget();

    const portal = attach(otherRoot, card);

    // Events on the original card's shadow root reach the portal.
    dispatch(cardShadow, hass);
    expect(portal.hass).to.deep.equal(hass);

    // Events on the portal's own root node do NOT (we routed past it).
    portal.hass = undefined as any;
    dispatch(otherRoot, otherHass);
    expect(portal.hass).to.be.undefined;
  });

  it('no-ops when getRootNode returns self (no scope)', () => {
    const el = new TestElement() as unknown as Mixed;
    (el as any).getRootNode = () => el;
    el.connectedCallback();
    // No throw, no listener attached. Disconnecting also a no-op.
    el.disconnectedCallback();
  });
});
