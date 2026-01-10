import { css } from 'lit';

/**
 * Dual rail slider style - two parallel lines for a modern look
 */
export const dualRailStyle = css`
  :host([slider='dual-rail'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.2) 2px,
      transparent 2px,
      transparent 10px,
      rgba(0, 0, 0, 0.2) 10px,
      rgba(0, 0, 0, 0.2) 12px
    );
  }
`;
