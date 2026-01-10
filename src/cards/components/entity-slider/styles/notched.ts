import { css } from 'lit';

/**
 * Notched slider style - track with notches/indents for tactile feedback
 */
export const notchedStyle = css`
  :host([slider='notched'])::before {
    content: '';
    position: absolute;
    top: -12%;
    bottom: -12%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.15) 10%,
      rgba(0, 0, 0, 0.25) 10%,
      rgba(0, 0, 0, 0.25) 12%,
      rgba(0, 0, 0, 0.15) 12%
    );
    border-radius: 100px;
  }
`;
