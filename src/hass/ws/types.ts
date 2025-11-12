/**
 * https://github.com/home-assistant/home-assistant-js-websocket/blob/master/lib/types.ts
 */

export type MessageBase = {
  id?: number;
  type: string;
  [key: string]: any;
};

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

export type HassServiceTarget = {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
  floor_id?: string | string[];
  label_id?: string | string[];
};
