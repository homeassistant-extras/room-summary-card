/**
 * Global mocha hook that hardens the entity-subscription singleton against
 * connection-less test doubles.
 *
 * Many component specs mount components that use `SubscribeEntityStateMixin`
 * with a `mockHass` that has no `connection`. The manager
 * (`getEntitySubscriptionManager`) is a per-connection singleton and schedules
 * a debounced `subscribe_entities` resubscribe (~50ms). That timer outlives the
 * test that created it and fires during a *later* test, where
 * `hass.connection.subscribeMessage` is `undefined` and throws an uncaught
 * exception — surfacing as "done() called multiple times" in whichever
 * unrelated test happened to own the event loop.
 *
 * This wraps `getEntitySubscriptionManager` so any `hass` without a
 * `connection` gets a benign no-op `subscribeMessage`. The leaked timer then
 * resolves harmlessly instead of throwing. Specs that already provide a real
 * connection (manager / mixin specs) are passed through untouched.
 *
 * Authored as `.cjs` (not `.ts`) so mocha loads it via `require` — that keeps
 * the `ts-node` / `tsconfig-paths` hooks (registered earlier in `.mocharc.json`)
 * active when we pull in the TypeScript manager module.
 */

// Resolved through tsconfig-paths + ts-node, both already registered by the
// time this hook file is required.
const managerModule = require('@delegates/entities/subscriptions/manager');

// todo get rid of this file once we don't need
const realGetEntitySubscriptionManager =
  managerModule.getEntitySubscriptionManager;

const installGuard = () => {
  managerModule.getEntitySubscriptionManager = (hass, config) => {
    if (hass && !hass.connection) {
      hass.connection = {
        subscribeMessage: () => Promise.resolve(() => {}),
      };
    }
    return realGetEntitySubscriptionManager(hass, config);
  };
};

installGuard();

// Reinstall before each test so a spec's blanket `sinon.restore()` can't strip
// the guard and let the leak reappear for subsequent tests in the process.
exports.mochaHooks = {
  beforeEach() {
    installGuard();
  },
};
