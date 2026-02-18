import type { HomeAssistant } from '@hass/types';
import { expect } from 'chai';
import { subscribeEntityState } from '../../../src/delegates/entities/subscribe-trigger';

describe('subscribe-trigger.ts', () => {
  describe('subscribeEntityState', () => {
    it('calls subscribeMessage with state trigger when connection available', async () => {
      const unsubscribeReal = () => {};
      const subscribeMessage = (
        callback: (r: unknown) => void,
        msg: unknown,
      ) => {
        expect(msg).to.deep.equal({
          type: 'subscribe_trigger',
          trigger: { platform: 'state', entity_id: 'light.test' },
        });
        return Promise.resolve(unsubscribeReal);
      };
      const hass = {
        connection: { subscribeMessage },
      } as HomeAssistant & {
        connection: { subscribeMessage: typeof subscribeMessage };
      };
      const onChange = () => {};
      const unsubscribe = await subscribeEntityState(
        hass,
        'light.test',
        onChange,
      );
      expect(unsubscribe).to.equal(unsubscribeReal);
    });
  });
});
