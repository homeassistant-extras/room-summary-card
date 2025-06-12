import type { EntityState } from '@type/room';

/**
 * Generates an RGB color string based on the state of an entity and its attributes.
 *
 * @param state - The current state of the entity, which includes attributes such as `rgb_color`.
 * @param onColor - A string representing the color to use when the entity is active.
 * @param offColor - A string representing the color to use when the entity is inactive.
 * @param active - A boolean indicating whether the entity is active.
 * @returns An RGB color string in the format `rgb(r, g, b)` if the conditions are met, or `undefined` otherwise.
 *
 * The function checks the following conditions before generating the RGB string:
 * - The entity is not active with an `onColor` defined.
 * - The entity is not inactive with an `offColor` defined.
 * - The `rgb_color` attribute exists, is an array, and contains exactly three elements.
 */

export const getRgbColor = (
  state: EntityState,
  onColor: string,
  offColor: string,
  active?: boolean,
): string | undefined => {
  const rgbColor = state.attributes.rgb_color;

  // This conditional block checks whether the `rgbColor` attribute of the entity state
  // should be used to generate an RGB color string. The conditions ensure:
  // 1. The entity is not active with an `onColor` defined (`!(active && onColor)`).
  // 2. The entity is not inactive with an `offColor` defined (`!(!active && offColor)`).
  // 3. The `rgbColor` attribute exists, is an array, and contains exactly three elements.
  // If all these conditions are met, the function returns an RGB string in the format
  // `rgb(r, g, b)` using the values from the `rgbColor` array.
  if (
    !(active && onColor) &&
    !(!active && offColor) &&
    rgbColor &&
    Array.isArray(rgbColor) &&
    rgbColor.length === 3
  ) {
    return `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
  }

  return undefined;
};
