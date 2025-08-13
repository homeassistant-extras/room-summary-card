import { css } from 'lit';

/**
 * Sensor styles for individual sensor display
 * Includes layout, icon visibility, and sensor-specific styles
 */
export const styles = css`
  :host {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    opacity: var(--text-opacity-theme, 0.4);
    margin-left: -2%;
    margin-top: 1%;
  }

  :host([hide-icons]) {
    column-gap: 8px;
    margin-left: 0px;
  }

  :host([layout='stacked']) {
    flex-direction: column;
  }

  :host([layout='bottom']) {
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
  }

  .sensor {
    display: flex;
    align-items: center;
    gap: 4px;
    --mdc-icon-size: var(--user-sensor-icon-size, 20px);
    cursor: pointer;
    position: relative;
    z-index: 0; /* create stacking context for ::before */
    padding: 2px 6px;
    border-radius: 6px;
    transition:
      transform 150ms ease,
      background-color 150ms ease,
      box-shadow 150ms ease,
      opacity 150ms ease;
  }

  /* Soft background hover using theme icon background color */
  .sensor::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--background-color-icon);
    opacity: 0;
    transform: scale(0.96);
    transition: inherit;
    z-index: -1;
  }

  .sensor:hover {
    transform: translateY(-1px);
  }

  .sensor:hover::before {
    opacity: 0.15;
    transform: scale(1);
  }

  .sensor ha-state-icon,
  .sensor ha-icon {
    flex-shrink: 0;
    transition:
      transform 150ms ease,
      filter 150ms ease,
      opacity 150ms ease;
  }

  .sensor:hover ha-state-icon,
  .sensor:hover ha-icon {
    transform: scale(1.2);
  }
`;
