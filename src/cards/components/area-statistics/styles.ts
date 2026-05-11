import { css } from 'lit';

/**
 * Styles for {@link AreaStatistics}.
 */
export const styles = css`
  :host {
    display: contents;
  }

  .stats {
    font-size: 0.8em;
    opacity: var(--text-opacity-theme, 0.4);
  }

  .text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: fit-content;
  }
`;
