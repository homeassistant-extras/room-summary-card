/**
 * Configuration settings for entity display and behavior.
 */
export interface Config {
  /** Area identifier where this configuration applies */
  area: string;

  navigate?: string;
  entity_1?: EntityConfig;
  entity_2?: EntityConfig;
  entity_3?: EntityConfig;
  entity_4?: EntityConfig;
  label_use_temperature?: boolean;
  label_use_brightness?: boolean;
  ulm_input_select?: string;
  ulm_input_select_option?: string;
  icon?: string;
}

export interface EntityConfig {
  entity_id: string;
  templates?: string[];
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export interface ActionConfig {
  action: string;
  entity?: string;
  navigation_path?: string;
  url_path?: string;
  perform_action?: string;
  target?: Record<string, any>;
}

/**
 * Represents a Home Assistant entity with its relationships to areas and devices.
 */
export interface Entity {
  /** ID of the area where this entity is located */
  area_id: string;

  /** ID of the physical device this entity belongs to */
  device_id: string;

  /** Array of descriptive labels associated with this entity */
  labels: string[];
}

/**
 * Represents a physical device in Home Assistant.
 */
export interface Device {
  /** Unique identifier for the device */
  id: string;

  /** ID of the area where this device is located */
  area_id: string;
}

/**
 * Root interface representing the Home Assistant instance structure.
 * Contains collections of entities and devices managed by Home Assistant.
 */
export interface HomeAssistant {
  /** Array of all entities registered in Home Assistant */
  entities: Entity[];

  /** Array of all physical devices registered in Home Assistant */
  devices: Device[];

  /** Object containing the current state of all entities in Home Assistant */
  states: EntityState[];

  callService(
    domain: string,
    service: string,
    serviceData: Record<string, any>
  ): void;
}

/**
 * Represents the current state and attributes of a Home Assistant entity.
 * Used to track an entity's status and properties at a given moment.
 */
export type EntityState = {
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
};
