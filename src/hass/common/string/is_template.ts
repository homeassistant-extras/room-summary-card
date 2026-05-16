/**
 * https://github.com/home-assistant/frontend/blob/dev/src/common/string/has-template.ts
 */

const TEMPLATE_SYNTAX = /{%|{{/;

/** True when the string looks like Jinja (e.g. contains `{{` or `{%`). */
export const isTemplateString = (value: string): boolean =>
  TEMPLATE_SYNTAX.test(value);
