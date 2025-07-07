import { css } from 'lit';

/**
 * CSS styles for mold indicator visual effects and animations
 */
export const moldStyles = css`
  /* Mold indicator container styling */
  .mold-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    animation: mold-pulse 2s ease-in-out infinite;
    position: relative;
    overflow: hidden;
  }

  /* Mold indicator icon styling */
  .mold-indicator ha-state-icon {
    color: white;
    --mdc-icon-size: 20px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    animation: mold-icon-bounce 1.5s ease-in-out infinite;
  }

  /* Mold indicator text styling */
  .mold-indicator .mold-text {
    color: white;
    font-size: 0.8em;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    animation: mold-text-glow 2s ease-in-out infinite alternate;
  }

  /* Glowing effect behind the indicator */
  .mold-indicator::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff6b6b, #ee5a52, #ff6b6b);
    border-radius: 14px;
    z-index: -1;
    animation: mold-glow 3s ease-in-out infinite;
    opacity: 0.6;
  }

  /* Warning triangle effect */
  .mold-indicator::after {
    content: '⚠';
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 12px;
    color: #ffeb3b;
    text-shadow: 0 0 4px rgba(255, 235, 59, 0.8);
    animation: mold-warning-flash 1s ease-in-out infinite;
  }

  /* Animation keyframes */
  @keyframes mold-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(255, 107, 107, 0.5);
    }
  }

  @keyframes mold-icon-bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  @keyframes mold-text-glow {
    0% {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    100% {
      text-shadow:
        0 1px 2px rgba(0, 0, 0, 0.3),
        0 0 8px rgba(255, 255, 255, 0.6);
    }
  }

  @keyframes mold-glow {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }

  @keyframes mold-warning-flash {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  /* Hover effects */
  .mold-indicator:hover {
    animation: mold-pulse 0.5s ease-in-out infinite;
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }

  .mold-indicator:hover::before {
    animation: mold-glow 1s ease-in-out infinite;
  }

  /* Dark theme adjustments */
  :host([dark]) .mold-indicator {
    background: linear-gradient(135deg, #d32f2f, #c62828);
    box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
  }

  :host([dark]) .mold-indicator::before {
    background: linear-gradient(45deg, #d32f2f, #c62828, #d32f2f);
  }
`;
