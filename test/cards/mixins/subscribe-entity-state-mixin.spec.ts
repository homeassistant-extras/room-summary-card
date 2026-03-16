import { SubscribeEntityStateMixin } from '@cards/mixins/subscribe-entity-state-mixin';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { LitElement } from 'lit';
import { stub, useFakeTimers } from 'sinon';

const RESUBSCRIBE_DEBOUNCE_MS = 50;

describe('SubscribeEntityStateMixin', () => {
  let TestElement: ReturnType<typeof SubscribeEntityStateMixin>;
  let element: InstanceType<typeof TestElement>;
  let hass: HomeAssistant;
  let unsubscribeSpy: ReturnType<typeof stub>;
  let capturedCallback: ((ev: unknown) => void) | null;
  let elementCounter = 0;

  beforeEach(() => {
    unsubscribeSpy = stub();
    capturedCallback = null;
    const subscribeMessage = (callback: (ev: unknown) => void) => {
      capturedCallback = callback;
      return Promise.resolve(unsubscribeSpy);
    };

    const elementName = `test-sub-entity-${elementCounter++}`;
    TestElement = SubscribeEntityStateMixin(LitElement);

    if (!customElements.get(elementName)) {
      customElements.define(elementName, TestElement);
    }

    element = new TestElement();
    hass = {
      language: 'en',
      localize: (key: string) => key,
      connection: { subscribeMessage },
      states: {
        'light.bedroom': {
          entity_id: 'light.bedroom',
          state: 'on',
          attributes: { friendly_name: 'Bedroom Light' },
        },
      },
    } as unknown as HomeAssistant;
    element.config = { area: 'test' };
  });

  it('should have _subscribedEntityState undefined initially', () => {
    expect(element['state']).to.be.undefined;
  });

  it('should subscribe when connected with entityId and hass set', async () => {
    const clock = useFakeTimers();
    element.hass = hass;
    element['entity'] = 'light.bedroom';

    element.connectedCallback();
    clock.tick(RESUBSCRIBE_DEBOUNCE_MS);
    await Promise.resolve();

    expect(capturedCallback).to.not.be.null;
    clock.restore();
  });

  it('should set initial state from hass.states on subscribe', async () => {
    const clock = useFakeTimers();
    element.hass = hass;
    element['entity'] = 'light.bedroom';

    element.connectedCallback();
    clock.tick(RESUBSCRIBE_DEBOUNCE_MS);
    await Promise.resolve();

    // subscribe_entities sends initial state via ev.a; fire it
    expect(capturedCallback).to.not.be.null;
    capturedCallback!({
      a: {
        'light.bedroom': {
          s: 'on',
          a: { friendly_name: 'Bedroom Light' },
          c: '',
          lc: 0,
          lu: 0,
        },
      },
      c: {},
    });

    expect(element['state']).to.deep.equal({
      entity_id: 'light.bedroom',
      state: 'on',
      attributes: { friendly_name: 'Bedroom Light' },
      domain: 'light',
    });
    clock.restore();
  });

  it('should not subscribe without entityId', () => {
    element.hass = hass;

    element.connectedCallback();

    expect(capturedCallback).to.be.null;
  });

  it('should not subscribe without hass', () => {
    element['entity'] = 'light.bedroom';

    element.connectedCallback();

    expect(capturedCallback).to.be.null;
  });
});
