import { css } from 'lit';

/**
 * CSS styles for occupancy-based visual indicators
 */
export const occupancyStyles = css`
  /* Card border styling when occupied */
  :host([occupied]) ha-card {
    animation: var(--occupancy-card-animation, none);
    border: var(--occupancy-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Icon styling when occupied */
  :host([occupied]) room-state-icon[room]::before {
    animation: var(--occupancy-icon-animation);
    background-color: var(--occupancy-icon-color, var(--background-color-icon));
    transition: all 0.3s ease;
  }

  /* Animation keyframes */
  @keyframes occupancy-pulse {
    0% {
      box-shadow: 0 0 5px
        var(--occupancy-card-border-color, var(--success-color));
    }
    100% {
      box-shadow: 0 0 20px
        var(--occupancy-card-border-color, var(--success-color));
    }
  }

  @keyframes icon-breathe {
    0% {
      transform: scale(1);
      opacity: 0.1;
    }
    100% {
      transform: scale(1.1);
      opacity: 0.4;
    }
  }
`;
