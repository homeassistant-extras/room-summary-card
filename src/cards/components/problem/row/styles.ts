import { css, CSSResult } from 'lit';

/**
 * Styles for the problem entity row component
 */
export const styles: CSSResult = css`
  /* Problem entity row */
  .problem-entity-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .problem-entity-row:hover {
    background-color: var(--primary-color, #03a9f4);
    background-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
  }

  .problem-entity-row.active {
    border-left: 3px solid var(--error-color, #f44336);
  }

  .problem-entity-row.inactive {
    opacity: 0.7;
  }

  /* Entity icon */
  .problem-entity-row ha-state-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
  }

  /* Entity info */
  .entity-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .entity-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--primary-text-color, #212121);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entity-state {
    font-size: 12px;
    color: var(--secondary-text-color, #757575);
  }

  /* Status indicator */
  .status-indicator {
    flex-shrink: 0;
  }

  .active-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    background-color: var(--error-color, red);
    color: white;
  }

  .inactive-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    background-color: var(--success-color, green);
    color: white;
  }

  /* Mobile responsive */
  @media (max-width: 600px) {
    .problem-entity-row {
      padding: 10px;
      gap: 10px;
    }

    .entity-name {
      font-size: 13px;
    }

    .entity-state {
      font-size: 11px;
    }
  }
`;
