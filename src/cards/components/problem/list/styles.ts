import { css, CSSResult } from 'lit';

/**
 * Styles for the problem entity list component
 */
export const styles: CSSResult = css`
  /* Problem entity list */
  .problem-entity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Empty state */
  .empty-state {
    padding: 32px 16px;
    text-align: center;
    color: var(--secondary-text-color, #757575);
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
  }
`;
