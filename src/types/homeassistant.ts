/**
 * @file Home Assistant TypeScript type definitions
 * @description Core type definitions for Home Assistant integration, including entities,
 * devices, states, and action handlers.
 */

/**
 * Root interface representing the Home Assistant instance structure.
 * Contains collections of entities and devices managed by Home Assistant.
 */
export interface HomeAssistant {
  /** Map of entity IDs to their corresponding entities */
  entities: Record<string, Entity>;

  /** Map of device IDs to their corresponding devices */
  devices: Record<string, Device>;

  /** Map of entity IDs to their current states */
  states: Record<string, State>;

  /** Map of area IDs to their corresponding areas */
  areas: Record<string, Area>;
}

/**
 * Represents an area in Home Assistant.
 */
export interface Area {
  /** Unique identifier for the area */
  area_id: string;

  /** Icon associated with the area */
  icon: string;
}

/**
 * Represents a physical device in Home Assistant.
 */
export interface Device {
  /** ID of the area where this device is located */
  area_id: string;
}

/**
 * Represents the current state and attributes of a Home Assistant entity.
 */
export interface State {
  /**
   * Unique identifier for the entity.
   * Format: `<domain>.<object_id>` (e.g., "light.living_room", "switch.kitchen")
   */
  entity_id: string;

  /**
   * Current state of the entity.
   * Common values: "on", "off", "unavailable", or numeric values
   */
  state: string;

  /**
   * Collection of additional entity attributes.
   * Can include properties like brightness, color, temperature, etc.
   */
  attributes: Record<string, any>;

  /** Returns the domain portion of the entity_id */
  getDomain: () => string;

  /** Returns whether the entity is currently active */
  isActive: () => boolean;
}

/**
 * Represents a Home Assistant entity with its relationships.
 */
export interface Entity {
  /** ID of the area where this entity is located */
  area_id: string;

  /** ID of the physical device this entity belongs to */
  device_id: string;

  /** Array of labels associated with the entity */
  labels: string[];
}
