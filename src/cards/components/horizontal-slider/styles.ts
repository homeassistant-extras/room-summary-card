import { css } from 'lit';

/**
 * Styles for the horizontal-slider component.
 *
 * The host is absolutely positioned so it sits flush with the bottom
 * edge of its containing card (ha-card has overflow: hidden, so the
 * slider clips to the card's rounded corners). The shared CSS variable
 * `--horizontal-slider-height` controls the strip height and is also
 * read by the parent card to lift overlapping elements.
 *
 * We always render <ha-slider>; the visual variant is driven by the
 * [style] reflected attribute and only applies CSS overrides
 * to ha-slider (no custom DOM):
 *
 *  - [style='ha']  : standard HA slider.
 *  - [style='bar'] : ha-slider re-styled as a chunky full-height
 *                           bar (track fills the strip, thumb hidden).
 *
 * User-controllable CSS variables (set via card `styles:`, theme, or
 * any ancestor):
 *
 *  - --user-slider-height       : strip height (default per-style).
 *  - --user-slider-track-color  : color of the inactive track. Set to
 *                                 `transparent` to let the card
 *                                 background show through.
 *  - --user-slider-bar-color    : color of the active fill (the
 *                                 "bar"). Defaults to the theme
 *                                 primary color.
 */
export const styles = css`
  :host {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }

  ha-slider {
    width: 100%;

    /* Active fill is exposed cleanly by ha-slider — no specificity
       fight. See
       https://github.com/home-assistant/frontend/blob/dev/src/components/ha-slider.ts */
    --ha-slider-indicator-color: var(
      --user-slider-bar-color,
      var(--primary-color)
    );
  }

  ha-slider::part(track),
  ha-slider::part(indicator) {
    border-radius: 0;
  }

  /* The inactive track paints from \`#track { background: var(--wa-color-neutral-fill-normal) }\`
     inside the slider's shadow DOM. The id selector beats ::part() on
     specificity, so we need !important to win — but only on background,
     scoped to ha-slider's track, which keeps the override from leaking
     into other webawesome components. */
  ha-slider::part(track) {
    background: var(
      --user-slider-track-color,
      var(--disabled-color)
    ) !important;
  }

  /* ---------------------------------------------------------------------
     'bar' style — re-style ha-slider so it visually IS the bottom strip.
     Track is forced tall enough to fill the host, thumb is hidden, and
     the indicator becomes the moving fill.
     --------------------------------------------------------------------- */
  :host([style='bar']) ha-slider {
    --ha-slider-track-size: var(--user-slider-height, 25px);
    --ha-slider-thumb-color: transparent;
  }

  /* ---------------------------------------------------------------------
     'ha' style — the standard HA slider, slightly thickened and themed.
     --------------------------------------------------------------------- */
  :host([style='ha']) {
    height: var(--user-slider-height, 3.5%);
  }
`;
