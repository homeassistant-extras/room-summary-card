/**
 * Configuration settings for entity display and behavior.
 */
export interface Config {
  area: string;
  entity: EntityConfig;
  entities: EntityConfig[];
  remove_fan: boolean;
  skip_climate_colors: boolean;
}

export interface EntityConfig {
  entity_id: string;
  tap_action?: ActionConfig;
}

export interface NavigateActionConfig extends BaseActionConfig {
  action: 'navigate';
  navigation_path: string;
}

export interface ToggleActionConfig extends BaseActionConfig {
  action: 'toggle';
}

export interface BaseActionConfig {
  action: string;
}

export type ActionConfig = ToggleActionConfig | NavigateActionConfig;

export interface EntityInformation {
  config: EntityConfig;
  state: State;
}

/**
 * Root interface representing the Home Assistant instance structure.
 * Contains collections of entities and devices managed by Home Assistant.
 */
export interface HomeAssistant {
  /** Array of all entities registered in Home Assistant */
  entities: Record<string, Entity>;

  /** Array of all physical devices registered in Home Assistant */
  devices: Record<string, Device>;

  /** Object containing the current state of all entities in Home Assistant */
  states: Record<string, State>;
  areas: Record<string, Area>;

  callService: (
    domain: ServiceCallRequest['domain'],
    service: ServiceCallRequest['service'],
    serviceData?: ServiceCallRequest['serviceData'],
  ) => Promise<void>;
}

export interface Area {
  area_id: string;
  icon: string;
}

/**
 * Represents a physical device in Home Assistant.
 */
export interface Device {
  /** ID of the area where this device is located */
  area_id: string;
}

// this.substring(0, this.indexOf('.'));?
/**
 * Represents the current state and attributes of a Home Assistant entity.
 * Used to track an entity's status and properties at a given moment.
 */
export type State = {
  /**
   * Unique identifier for the entity.
   * Format: `<domain>.<object_id>` (e.g. "light.living_room", "switch.kitchen")
   */
  entity_id: string;

  /**
   * Current state of the entity.
   * Common values include: "on", "off", "unavailable", or numeric values
   */
  state: string;

  /**
   * Collection of additional entity attributes.
   * Can include properties like brightness, color, temperature, etc.
   * Keys are strings, values can be any type
   */
  attributes: Record<string, any>;

  getDomain: () => string;
};

/**
 * Represents a Home Assistant entity with its relationships to areas and devices.
 */
export interface Entity {
  /** ID of the area where this entity is located */
  area_id: string;

  /** ID of the physical device this entity belongs to */
  device_id: string;
}

export interface ServiceCallRequest {
  domain: string;
  service: string;
  serviceData?: Record<string, any>;
}

export interface ActionHandlerDetail {
  action: 'hold' | 'tap' | 'double_tap';
}

export interface HASSDomEvent<T> extends Event {
  detail: T;
}

export type ActionHandlerEvent = HASSDomEvent<ActionHandlerDetail>;

export interface HASSDomEvent<T> extends Event {
  detail: T;
}

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}
