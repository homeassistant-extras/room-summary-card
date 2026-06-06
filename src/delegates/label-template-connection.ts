import { subscribeRenderTemplate } from '@homeassistant-extras/hass/data/ws-templates';
import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import type { UnsubscribeFunc } from '@homeassistant-extras/hass/ws/types';

/**
 * One live Jinja `render_template` subscription for an entity `label` that
 * contains `{{` / `{%`. Tears down when the template string, entity context,
 * or hass instance should change.
 */
export class LabelTemplateConnection {
  private _unsub?: Promise<UnsubscribeFunc>;
  private _subscriptionKey?: string;
  private _callbackGen = 0;
  private _displayedText = '';

  constructor(private readonly _requestUpdate: () => void) {}

  get displayedText(): string {
    return this._displayedText;
  }

  sync(
    hass: HomeAssistant | undefined,
    entityId: string,
    template: string | undefined,
  ): void {
    const trimmed = template?.trim();
    if (!hass?.connection || !trimmed) {
      this._tearDown();
      this._displayedText = '';
      this._subscriptionKey = undefined;
      this._requestUpdate();
      return;
    }

    const key = `${entityId}\0${trimmed}`;
    if (this._subscriptionKey === key && this._unsub) {
      return;
    }

    this._tearDown();
    this._subscriptionKey = key;
    this._displayedText = '';
    this._callbackGen++;
    const generation = this._callbackGen;

    this._unsub = subscribeRenderTemplate(
      hass.connection,
      (result) => {
        if (generation !== this._callbackGen) {
          return;
        }
        if ('error' in result) {
          console.warn(
            'room-summary-card: label template:',
            result.error,
            `(${entityId})`,
          );
          return;
        }
        this._displayedText = result.result ?? '';
        this._requestUpdate();
      },
      {
        template: trimmed,
        entity_ids: entityId,
        strict: true,
      },
    );
  }

  private _tearDown(): void {
    if (this._unsub) {
      void this._unsub.then((u) => {
        u();
      });
      this._unsub = undefined;
    }
  }

  disconnect(): void {
    this._tearDown();
    this._subscriptionKey = undefined;
    this._callbackGen++;
    this._displayedText = '';
  }
}
