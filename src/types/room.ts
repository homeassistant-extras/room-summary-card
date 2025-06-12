import type { EntityConfig } from './config';

export interface RoomInformation {
  /** The area name */
  area_name: string;
} /**
 * Combined entity configuration and state information.
 */

export interface EntityInformation {
  /** The entity configuration */
  config: EntityConfig;

  /** The entity state */
  state: EntityState | undefined;
}

export interface EntityState {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes: Record<string, any>;

  /** Returns the domain portion of the entity_id */
  domain: string;
}
