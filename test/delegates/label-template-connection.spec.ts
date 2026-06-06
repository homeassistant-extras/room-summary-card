import { LabelTemplateConnection } from '@delegates/label-template-connection';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('label-template-connection.ts', () => {
  let conn: LabelTemplateConnection;
  let hass: HomeAssistant;
  let requestUpdate: sinon.SinonStub;
  let subscribeMessage: sinon.SinonStub;
  let callbacks: ((msg: unknown) => void)[];
  let messages: unknown[];
  let unsubscribes: sinon.SinonStub[];

  beforeEach(() => {
    requestUpdate = stub();
    callbacks = [];
    messages = [];
    unsubscribes = [];

    subscribeMessage = stub().callsFake((callback, message) => {
      const unsubscribe = stub();
      callbacks.push(callback);
      messages.push(message);
      unsubscribes.push(unsubscribe);
      return Promise.resolve(unsubscribe);
    });

    hass = {
      connection: {
        subscribeMessage,
      },
    } as unknown as HomeAssistant;

    conn = new LabelTemplateConnection(requestUpdate);
  });

  it('starts with no displayed text', () => {
    expect(conn.displayedText).to.equal('');
  });

  it('subscribes to a trimmed template and updates displayed text', () => {
    conn.sync(
      hass,
      'sensor.temperature',
      '  {{ states("sensor.temperature") }}  ',
    );

    expect(messages[0]).to.deep.equal({
      type: 'render_template',
      template: '{{ states("sensor.temperature") }}',
      entity_ids: 'sensor.temperature',
      strict: true,
    });

    callbacks[0]?.({
      result: '21 °C',
      listeners: {
        all: false,
        domains: [],
        entities: ['sensor.temperature'],
        time: false,
      },
    });

    expect(conn.displayedText).to.equal('21 °C');
    expect(requestUpdate.calledOnce).to.be.true;
  });

  it('does not resubscribe for the same entity and template', () => {
    conn.sync(hass, 'sensor.temperature', '{{ states("sensor.temperature") }}');
    conn.sync(
      hass,
      'sensor.temperature',
      '  {{ states("sensor.temperature") }}  ',
    );

    expect(subscribeMessage.calledOnce).to.be.true;
  });

  it('tears down the previous subscription and ignores stale callbacks', async () => {
    conn.sync(hass, 'sensor.temperature', '{{ states("sensor.temperature") }}');
    conn.sync(hass, 'sensor.humidity', '{{ states("sensor.humidity") }}');
    await Promise.resolve();

    expect(unsubscribes[0]?.calledOnce).to.be.true;

    callbacks[0]?.({
      result: 'stale',
      listeners: { all: false, domains: [], entities: [], time: false },
    });
    callbacks[1]?.({
      result: '45%',
      listeners: { all: false, domains: [], entities: [], time: false },
    });

    expect(conn.displayedText).to.equal('45%');
    expect(requestUpdate.calledOnce).to.be.true;
  });

  it('clears and tears down when sync receives no usable template', async () => {
    conn.sync(hass, 'sensor.temperature', '{{ states("sensor.temperature") }}');
    callbacks[0]?.({
      result: '21 °C',
      listeners: { all: false, domains: [], entities: [], time: false },
    });

    conn.sync(hass, 'sensor.temperature', '  ');
    await Promise.resolve();

    expect(unsubscribes[0]?.calledOnce).to.be.true;
    expect(conn.displayedText).to.equal('');
    expect(requestUpdate.calledTwice).to.be.true;
  });

  it('disconnects and ignores callbacks from the old subscription', async () => {
    conn.sync(hass, 'sensor.temperature', '{{ states("sensor.temperature") }}');
    callbacks[0]?.({
      result: '21 °C',
      listeners: { all: false, domains: [], entities: [], time: false },
    });

    conn.disconnect();
    await Promise.resolve();
    callbacks[0]?.({
      result: 'stale',
      listeners: { all: false, domains: [], entities: [], time: false },
    });

    expect(unsubscribes[0]?.calledOnce).to.be.true;
    expect(conn.displayedText).to.equal('');
    expect(requestUpdate.calledOnce).to.be.true;
  });

  it('warns but keeps current text when Home Assistant returns an error', () => {
    const warnStub = stub(console, 'warn');
    conn.sync(hass, 'sensor.temperature', '{{ broken }}');

    callbacks[0]?.({
      error: 'Template error',
      level: 'ERROR',
    });

    expect(warnStub.calledWithMatch('room-summary-card: label template:')).to.be
      .true;
    expect(conn.displayedText).to.equal('');
    expect(requestUpdate.called).to.be.false;

    warnStub.restore();
  });
});
