import { css } from 'lit';

/**
 * Track slider style - sunken track/well that the icon slides along
 */
export const trackStyle = css`
  :host([slider='track'])::before {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 100px;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.1);
  }
`;
