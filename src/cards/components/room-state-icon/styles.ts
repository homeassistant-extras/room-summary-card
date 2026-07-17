import { css } from 'lit';

/**
 * Icon and visual indicator styles
 */
export const styles = css`
  :host {
    width: var(--user-entity-icon-size, 100%);
    border-radius: 50%;
    overflow: hidden;
  }

  /* Icon container styling */
  .icon {
    cursor: pointer;
    align-self: center;
    position: relative;
    display: flex;
    justify-content: center;
    aspect-ratio: 1 / 1;
  }

  /* When this icon is the main room icon AND owns the background,
     route the card-level --user-opacity here instead of to the card. */
  :host([room][icon-bg]) .icon room-background-image {
    --icon-color-opacity: var(--user-opacity, var(--background-opacity-icon));
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    opacity: var(--icon-opacity);
    --mdc-icon-size: 100%;
    filter: var(--icon-filter, none);
  }

  /* Entity state styling */
  .entity-state {
    position: absolute;
    font-size: var(--user-entity-state-font-size, 0.6em);
    text-align: center;
    overflow: hidden;
    margin-top: 90%;
    display: block;
    color: var(--user-entity-state-color, var(--secondary-text-color));
    opacity: var(--user-entity-state-opacity, 1);
    font-weight: var(--user-entity-state-font-weight, normal);
  }

  .box {
    cursor: pointer;
    align-self: center;
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* Alarm styling: map the active alarm onto the generic --icon-alarm-*
     variables consumed by room-background-image's layers. */
  :host([room][alarm]) .icon {
    --icon-alarm-transition: all 0.3s ease;
  }

  :host([room][alarm='smoke']) .icon {
    --icon-alarm-animation: var(--smoke-icon-animation);
    --icon-alarm-color: var(--smoke-icon-color);
  }

  :host([room][alarm='gas']) .icon {
    --icon-alarm-animation: var(--gas-icon-animation);
    --icon-alarm-color: var(--gas-icon-color);
  }

  :host([room][alarm='water']) .icon {
    --icon-alarm-animation: var(--water-icon-animation);
    --icon-alarm-color: var(--water-icon-color);
  }

  :host([room][alarm='occupied']) .icon {
    --icon-alarm-animation: var(--occupancy-icon-animation);
    --icon-alarm-color: var(--occupancy-icon-color);
  }
`;
