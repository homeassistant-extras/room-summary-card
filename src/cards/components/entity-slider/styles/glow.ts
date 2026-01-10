import { css } from 'lit';

/**
 * Glow slider style - glowing line effect using the primary color
 */
export const glowStyle = css`
  :host([slider='glow'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    background: rgba(var(--rgb-primary-color, 66, 133, 244), 0.4);
    border-radius: 3px;
    box-shadow:
      0 0 8px rgba(var(--rgb-primary-color, 66, 133, 244), 0.6),
      0 0 12px rgba(var(--rgb-primary-color, 66, 133, 244), 0.3);
  }
`;
