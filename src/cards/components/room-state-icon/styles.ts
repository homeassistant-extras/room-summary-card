import { css } from 'lit';

/**
 * Icon and visual indicator styles
 */
export const styles = css`
  /* Icon container styling */
  .icon {
    cursor: pointer;
    align-self: center;
    position: relative;
    display: flex;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }

  .icon::before {
    content: '';
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-color-icon);
    opacity: var(--background-opacity-icon);
  }

  /* Icon background image styling */
  :host([image][icon-bg]) .icon::before {
    background-image:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.4),
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      ),
      var(--background-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    opacity: var(--icon-opacity);
    --mdc-icon-size: 100%;
  }

  /* Entity label styling */
  .entity-label {
    position: absolute;
    font-size: 0.7em;
    text-align: center;
    overflow: hidden;
    margin-top: 75%;
  }
`;
