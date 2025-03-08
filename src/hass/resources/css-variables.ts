/**
 * https://github.com/home-assistant/frontend/blob/dev/src/resources/css-variables.ts
 */

export function computeCssVariable(
  props: string | string[],
): string | undefined {
  if (Array.isArray(props)) {
    return props
      .reverse()
      .reduce<
        string | undefined
      >((str, variable) => `var(${variable}${str ? `, ${str}` : ''})`, undefined);
  }
  return `var(${props})`;
}
