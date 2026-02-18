import { SubscribeEntityStateMixin } from '@cards/mixins/subscribe-entity-state-mixin';
import * as subscribeTrigger from '@delegates/entities/subscribe-trigger';
import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { LitElement } from 'lit';
import { type SinonStub, stub } from 'sinon';

describe('SubscribeEntityStateMixin', () => {
  let TestElement: ReturnType<typeof SubscribeEntityStateMixin>;
  let element: InstanceType<typeof TestElement>;
  let hass: HomeAssistant;
  let subscribeStub: SinonStub;
  let unsubscribeSpy: SinonStub;
  let elementCounter = 0;

  beforeEach(() => {
    unsubscribeSpy = stub();
    subscribeStub = stub(subscribeTrigger, 'subscribeEntityState').resolves(
      unsubscribeSpy,
    );

    const elementName = `test-sub-entity-${elementCounter++}`;
    TestElement = SubscribeEntityStateMixin(LitElement);

    if (!customElements.get(elementName)) {
      customElements.define(elementName, TestElement);
    }

    element = new TestElement();
    hass = {
      language: 'en',
      localize: (key: string) => key,
      states: {
        'light.bedroom': {
          entity_id: 'light.bedroom',
          state: 'on',
          attributes: { friendly_name: 'Bedroom Light' },
        },
      },
    } as unknown as HomeAssistant;
  });

  afterEach(() => {
    subscribeStub.restore();
  });

  it('should have _subscribedEntityState undefined initially', () => {
    expect(element['_subscribedEntityState']).to.be.undefined;
  });

  it('should subscribe when connected with entityId and hass set', async () => {
    element.hass = hass;
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    expect(subscribeStub.calledOnce).to.be.true;
    expect(subscribeStub.firstCall.args[1]).to.equal('light.bedroom');
  });

  it('should set initial state from hass.states on subscribe', () => {
    element.hass = hass;
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    expect(element['_subscribedEntityState']).to.deep.equal({
      entity_id: 'light.bedroom',
      state: 'on',
      attributes: { friendly_name: 'Bedroom Light' },
      domain: 'light',
    });
  });

  it('should not subscribe without entityId', () => {
    element.hass = hass;

    element.connectedCallback();

    expect(subscribeStub.called).to.be.false;
  });

  it('should not subscribe without hass', () => {
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    expect(subscribeStub.called).to.be.false;
  });

  it('should unsubscribe on disconnectedCallback', async () => {
    element.hass = hass;
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    // Wait for the subscribe promise to resolve
    await Promise.resolve();

    element.disconnectedCallback();

    expect(unsubscribeSpy.calledOnce).to.be.true;
  });

  it('should update state when trigger callback fires with changed state', () => {
    element.hass = hass;
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    // Get the onChange callback passed to subscribeEntityState
    const onChange = subscribeStub.firstCall.args[2];

    onChange({
      variables: {
        trigger: {
          from_state: {
            entity_id: 'light.bedroom',
            state: 'on',
            attributes: { friendly_name: 'Bedroom Light' },
          },
          to_state: {
            entity_id: 'light.bedroom',
            state: 'off',
            attributes: { friendly_name: 'Bedroom Light' },
          },
        },
      },
    });

    expect(element['_subscribedEntityState']).to.deep.equal({
      entity_id: 'light.bedroom',
      state: 'off',
      attributes: { friendly_name: 'Bedroom Light' },
      domain: 'light',
    });
  });

  it('should not update state when from_state equals to_state', () => {
    element.hass = hass;
    element['entityId'] = 'light.bedroom';

    element.connectedCallback();

    const initialState = element['_subscribedEntityState'];
    const onChange = subscribeStub.firstCall.args[2];

    onChange({
      variables: {
        trigger: {
          from_state: {
            entity_id: 'light.bedroom',
            state: 'on',
            attributes: { friendly_name: 'Bedroom Light' },
          },
          to_state: {
            entity_id: 'light.bedroom',
            state: 'on',
            attributes: { friendly_name: 'Bedroom Light' },
          },
        },
      },
    });

    expect(element['_subscribedEntityState']).to.deep.equal(initialState);
  });
});
