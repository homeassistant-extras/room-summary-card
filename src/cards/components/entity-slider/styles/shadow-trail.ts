import { css } from 'lit';

/**
 * Shadow trail slider style - shadow that follows the icon position
 */
export const shadowTrailStyle = css`
  :host([slider='shadow-trail'])::after {
    content: '';
    position: absolute;
    top: var(--slider-position, 50%);
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 40px;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.15) 0%,
      transparent 70%
    );
    transition: top 0.1s ease;
    pointer-events: none;
  }
`;
