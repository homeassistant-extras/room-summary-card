/**
 * Home Assistant `render_template` websocket subscription.
 * @see https://github.com/home-assistant/frontend/blob/dev/src/data/ws-templates.ts
 */

import type { Connection, SubscriptionUnsubscribe } from '@hass/ws/types';

export interface RenderTemplateResult {
  result: string;
  listeners: TemplateListeners;
}

export interface RenderTemplateError {
  error: string;
  level: 'ERROR' | 'WARNING';
}

export interface TemplateListeners {
  all: boolean;
  domains: string[];
  entities: string[];
  time: boolean;
}

export const subscribeRenderTemplate = (
  conn: Connection,
  onChange: (result: RenderTemplateResult | RenderTemplateError) => void,
  params: {
    template: string;
    entity_ids?: string | string[];
    variables?: Record<string, unknown>;
    timeout?: number;
    strict?: boolean;
    report_errors?: boolean;
  },
): Promise<SubscriptionUnsubscribe> =>
  conn.subscribeMessage(
    (msg: RenderTemplateResult | RenderTemplateError) => onChange(msg),
    {
      type: 'render_template',
      ...params,
    },
  );
