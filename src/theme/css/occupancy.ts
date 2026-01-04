import { css } from 'lit';

/**
 * CSS styles for occupancy, smoke, gas, and water alarm-based visual indicators
 */
export const occupancyStyles = css`
  /* Card border styling for smoke */
  :host([alarm='smoke']) ha-card {
    animation: var(--smoke-card-animation, none);
    border: var(--smoke-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Card border styling for gas */
  :host([alarm='gas']) ha-card {
    animation: var(--gas-card-animation, none);
    border: var(--gas-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Card border styling for water */
  :host([alarm='water']) ha-card {
    animation: var(--water-card-animation, none);
    border: var(--water-card-border);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Card border styling for occupancy */
  :host([alarm='occupied']) ha-card {
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

  /* Animation keyframes for gas */
  @keyframes gas-pulse {
    0% {
      box-shadow: 0 0 5px var(--gas-card-border-color, #ff9800);
    }
    100% {
      box-shadow: 0 0 20px var(--gas-card-border-color, #ff9800);
    }
  }

  /* Animation keyframes for water */
  @keyframes water-pulse {
    0% {
      box-shadow: 0 0 5px var(--water-card-border-color, #2196f3);
    }
    100% {
      box-shadow: 0 0 20px var(--water-card-border-color, #2196f3);
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
