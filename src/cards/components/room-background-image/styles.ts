import { css } from 'lit';

/**
 * Background layer styles
 */
export const styles = css`
  :host {
    --default-overlay: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0)
    );
  }

  :host([icon]) {
    --default-overlay: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4),
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0)
    );
  }

  .color {
    position: absolute;
    inset: 0;
    background-color: var(--background-color-card);
    opacity: var(
      --user-opacity,
      var(--opacity-theme, var(--background-opacity-card))
    );
    filter: var(--background-filter, none);
  }

  /* Image layer: hui-image fills the box (object-fit: cover inside),
     with the user gradient composited on top via ::after. Opacity and
     filter apply to the wrapper so image + gradient fade as one, matching
     the old single-declaration CSS background. */
  .image {
    position: absolute;
    inset: 0;
    overflow: hidden;
    opacity: var(
      --user-opacity,
      var(--opacity-theme, var(--background-opacity-card))
    );
    filter: var(--background-filter, none);
  }

  .image hui-image {
    display: block;
    width: 100%;
    height: 100%;
  }

  .image::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(
      --user-background-image-overlay,
      var(--default-overlay)
    );
  }

  /* Icon placement: the fill circle. Alarm state is routed in by
     room-state-icon via the --icon-alarm-* variables. */
  :host([icon]) .color {
    background-color: var(--icon-alarm-color, var(--background-color-icon));
    opacity: var(--icon-color-opacity, var(--background-opacity-icon));
    filter: var(--icon-filter, none);
    animation: var(--icon-alarm-animation, none);
    transition: var(--icon-alarm-transition, none);
  }

  :host([icon]) .image {
    opacity: var(--icon-color-opacity, var(--background-opacity-icon));
    filter: var(--icon-filter, none);
    animation: var(--icon-alarm-animation, none);
    transition: var(--icon-alarm-transition, none);
  }

  /* Same keyframes as room-state-icon; animation names don't resolve
     across shadow trees, so the color layer needs its own copy. */
  @keyframes icon-breathe {
    0% {
      transform: scale(1);
      opacity: 0.1;
    }
    100% {
      transform: scale(1.1);
      opacity: 0.4;
    }
  }
`;
