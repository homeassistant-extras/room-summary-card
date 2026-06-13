import { css } from 'lit';

/**
 * Entity collection styles for entity icon display.
 * Column-first grid: icons fill down, then wrap to the next column.
 *
 * The strip is anchored to the card's right edge and widens LEFT as columns
 * are added, so wrapped icons keep their full size (#419). Knobs (all under
 * `styles.entities`):
 * - `--user-entities-wrap` — rows per column before wrapping (default 4)
 * - `--user-entity-column-width` — fixed lane width (e.g. `80px`); replaces
 *   the height-derived lane width
 * - `--user-entities-max-columns` — cap strip growth; `1` restores the
 *   shrink-to-fit look where columns split the single-lane width
 * - `min-width: auto` — let the strip grow its grid track instead of
 *   overlapping the card interior (which shrinks the room icon)
 */
export const styles = css`
  :host {
    /* Lanes needed for the current entity count, capped by the user max.
       --entity-count is set inline by the component; doing the division in
       CSS keeps --user-entities-wrap overridable from themes/card-mod. */
    --entity-columns: clamp(
      1,
      round(up, calc(var(--entity-count, 1) / var(--user-entities-wrap, 4))),
      var(--user-entities-max-columns, 99)
    );
    height: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(var(--user-entities-wrap, 4), 1fr);
    grid-auto-columns: 1fr;
    justify-self: end;
    justify-items: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    /* Strip width scales with column count so wrapped icons keep full size;
       a single column matches the pre-wrap 0.23 strip ratio. */
    aspect-ratio: calc(0.23 * var(--entity-columns)) / 1;
    /* Fixed lane width override. Height is definite, so when this resolves
       it wins over the ratio-derived width; while --user-entity-column-width
       is unset the declaration is invalid and width falls back to auto. */
    width: calc(
      var(--user-entity-column-width) * var(--entity-columns) + 8px *
        (var(--entity-columns) - 1)
    );
    padding: 5px 5px 5px 0;
    /* Overlap the card interior instead of growing the outer grid track,
       so the room icon keeps its size when the strip widens. Override with
       min-width: auto under styles.entities to shrink the room icon instead. */
    min-width: 0;
    /* Columns fill right-to-left: the first column stays on the card's
       right edge and wrapped columns appear to its LEFT. Override with
       direction: ltr under styles.entities to wrap rightward instead. */
    direction: rtl;
  }

  /* Keep icon labels/state text left-to-right despite the rtl grid. */
  :host > * {
    direction: ltr;
  }
`;
