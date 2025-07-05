import { iconStyles } from '@theme/styles';
import { css } from 'lit';

/**
 * Entity collection styles for entity icon display
 * Includes grid layout, positioning, and entity-specific styles
 */
export const styles = css`
  :host {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    aspect-ratio: 0.23 / 1;
    padding: 5px 5px 5px 0;
  }

  .entity {
    width: var(--user-entity-icon-size, inherit);
  }

  ${iconStyles}
`;
