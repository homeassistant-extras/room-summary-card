import { html, nothing, type TemplateResult } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  styleMap,
  type StyleMapDirective,
} from 'lit-html/directives/style-map.js';
import memoizeOne from 'memoize-one';

/**
 * Converts a styles object to a <style> tag with :host selector
 * Memoized for performance when the same styles object is passed repeatedly
 *
 * Special handling for keyframes:
 * - Use "keyframes" key with animation definitions as value
 * - Format: { keyframes: "breathing { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }" }
 * - Multiple animations can be separated with a delimiter or as separate entries
 *
 * @param styles - Object with CSS property key-value pairs
 * @returns lit-html template with <style>:host{...}</style> or nothing if no styles
 */
export const stylesToHostCss = memoizeOne(
  (styles?: Record<string, string>): TemplateResult | typeof nothing => {
    if (!styles || Object.keys(styles).length === 0) return nothing;

    // Separate keyframes from regular styles
    const keyframesEntries: string[] = [];
    const regularStyles: string[] = [];

    for (const [key, value] of Object.entries(styles)) {
      if (key === 'keyframes') {
        // Handle keyframes specially
        keyframesEntries.push(`@keyframes ${value}`);
      } else {
        // Regular CSS property
        regularStyles.push(`${key}: ${value};`);
      }
    }

    const cssString = regularStyles.join(' ');
    const keyframesString = keyframesEntries.join('\n');

    return html`
      <style>
        ${keyframesString}
        :host {
          ${cssString}
        }
      </style>
    `;
  },
);

/**
 * Converts a styles object to a styleMap directive result
 * Memoized for performance when the same styles object is passed repeatedly
 *
 * @param styles - Object with CSS property key-value pairs
 * @returns DirectiveResult ready for use in style attribute
 */
export const stylesToMap = memoizeOne(
  (
    styles?: Record<string, string>,
  ): DirectiveResult<typeof StyleMapDirective> => {
    if (!styles || Object.keys(styles).length === 0) {
      return nothing;
    }

    return styleMap(styles);
  },
);
