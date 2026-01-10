import { css } from 'lit';

/**
 * Dots slider style - dotted track with ticks at regular intervals
 */
export const dotsStyle = css`
  :host([slider='dots'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      transparent calc(25% - 3px),
      rgba(0, 0, 0, 0.3) calc(25% - 3px),
      rgba(0, 0, 0, 0.3) calc(25% + 3px),
      transparent calc(25% + 3px)
    );
    border-radius: 4px;
  }
`;
