/**
 * https://github.com/home-assistant/home-assistant-js-websocket/blob/master/lib/types.ts
 */
export type HassEntityBase = {
  entity_id: string;
  state: string;
  attributes: HassEntityAttributeBase;
};

export type HassEntityAttributeBase = {
  friendly_name?: string;
  unit_of_measurement?: string;
  icon?: string;
  entity_picture?: string;
  supported_features?: number;
  hidden?: boolean;
  assumed_state?: boolean;
  device_class?: string;
  state_class?: string;
  restored?: boolean;
};

export type HassEntity = HassEntityBase & {
  attributes: { [key: string]: any };
};

export type HassEntities = { [entity_id: string]: HassEntity };
