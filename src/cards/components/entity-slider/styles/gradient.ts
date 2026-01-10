import { css } from 'lit';

/**
 * Gradient slider style - gradient line effect with smooth color transitions
 */
export const gradientStyle = css`
  :host([slider='gradient'])::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.5),
      rgba(0, 0, 0, 0.3)
    );
    border-radius: 3px;
  }
`;
