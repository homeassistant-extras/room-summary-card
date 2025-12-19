/**
 * @file Light Configuration TypeScript type definitions
 * @description Type definitions for light entity configuration.
 */

/**
 * Light type for determining how the light affects the card styling.
 * - 'ambient': Light only affects the card background, not the icon/title
 */
export type LightType = 'ambient';

/**
 * Extended light configuration with type support.
 */
export interface LightConfigObject {
  /** The entity ID of the light */
  entity_id: string;

  /** The type of light - affects how the light influences card styling */
  type?: LightType;
}

/**
 * Light configuration can be either a simple entity ID string or an extended configuration object.
 */
export type LightConfig = string | LightConfigObject;
