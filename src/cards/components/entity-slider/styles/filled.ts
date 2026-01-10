import { css } from 'lit';

/**
 * Filled slider style - progress bar that shows brightness level
 */
export const filledStyle = css`
  :host([slider='filled'])::before {
    content: '';
    position: absolute;
    top: var(--slider-position, 50%);
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: rgba(var(--rgb-primary-color, 0, 0, 0), 0.2);
    border-radius: 100px;
    transition: top 0.1s ease;
  }
`;
