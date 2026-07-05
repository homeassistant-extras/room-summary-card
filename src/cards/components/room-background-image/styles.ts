import { css, type CSSResult } from 'lit';

/**
 * Styles for the room background image component
 */
export const styles: CSSResult = css`
  :host {
    position: absolute;
    inset: 0;
    display: block;
    overflow: hidden;
    pointer-events: none;
    border-radius: inherit;
    opacity: var(
      --user-opacity,
      var(--opacity-theme, var(--background-opacity-card))
    );
    filter: var(--background-filter, none);
  }

  /* Icon placement: clipped to the icon circle, icon opacity/filter chain */
  :host([icon]) {
    border-radius: 50%;
    opacity: var(--user-opacity, var(--background-opacity-icon));
    filter: var(--icon-filter, none);
  }

  .color,
  hui-image,
  .overlay {
    position: absolute;
    inset: 0;
  }

  .color {
    background-color: var(--background-color-card);
  }

  .overlay {
    background-image: var(--user-background-image-overlay, none);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }
`;
