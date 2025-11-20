import { css } from 'lit';

/**
 * CSS styles for occupancy and smoke alarm-based visual indicators
 */
export const occupancyStyles = css`
  /* Card border styling when smoke is detected (takes priority over occupancy) */
  :host([smoke]) ha-card {
    animation: var(--smoke-card-animation, none);
    border: var(--smoke-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Card border styling when occupied (only if smoke is not detected) */
  :host([occupied]:not([smoke])) ha-card {
    animation: var(--occupancy-card-animation, none);
    border: var(--occupancy-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Animation keyframes for smoke */
  @keyframes smoke-pulse {
    0% {
      box-shadow: 0 0 5px var(--smoke-card-border-color, var(--error-color));
    }
    100% {
      box-shadow: 0 0 20px var(--smoke-card-border-color, var(--error-color));
    }
  }

  /* Animation keyframes for occupancy */
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
`;
