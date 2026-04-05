import { css } from 'lit';

/**
 * Entity collection styles for entity icon display.
 * Column-first grid: icons fill down, then wrap to the next column.
 * Override rows per column via `styles.entities['--user-entities-wrap']` (default 4).
 */
export const styles = css`
  :host {
    height: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(var(--user-entities-wrap, 4), 1fr);
    justify-items: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    aspect-ratio: 0.23 / 1;
    padding: 5px 5px 5px 0;
  }
`;
