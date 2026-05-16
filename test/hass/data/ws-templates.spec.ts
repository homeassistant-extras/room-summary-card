import { subscribeRenderTemplate } from '@hass/data/ws-templates';
import type { Connection } from '@hass/ws/types';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('ws-templates.ts', () => {
  it('subscribes with render_template message and forwards results', async () => {
    let capturedMsg: unknown;
    let capturedCb: ((msg: unknown) => void) | undefined;
    const unsubscribe = stub();
    const subscribeMessage = stub().callsFake(
      (cb: (msg: unknown) => void, msg: unknown) => {
        capturedCb = cb;
        capturedMsg = msg;
        return Promise.resolve(unsubscribe);
      },
    );
    const conn = { subscribeMessage } as unknown as Connection;
    const onChange = stub();

    const unsub = await subscribeRenderTemplate(conn, onChange, {
      template: '{{ states("sensor.temp") }}',
      entity_ids: 'sensor.temp',
    });

    expect(capturedMsg).to.deep.equal({
      type: 'render_template',
      template: '{{ states("sensor.temp") }}',
      entity_ids: 'sensor.temp',
    });
    expect(unsub).to.equal(unsubscribe);

    capturedCb?.({ result: '21 °C', listeners: { all: false, domains: [], entities: ['sensor.temp'], time: false } });
    expect(onChange.calledOnce).to.be.true;
    expect(onChange.firstCall.args[0]).to.deep.equal({
      result: '21 °C',
      listeners: { all: false, domains: [], entities: ['sensor.temp'], time: false },
    });
  });
});
