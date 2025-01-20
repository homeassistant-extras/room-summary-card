import { css } from "lit";

export const styles = css`
  .card {
    padding: 5px;
    border-radius: 20px;
    box-shadow: var(--box-shadow);
    background: var(--ha-card-background, var(--card-background-color, white));
    line-height: normal;
    overflow: hidden;
  }

  .grid {
    display: grid;
    grid-template-areas:
      "n n n e1"
      "l l l e2"
      "r r . e3"
      "r r . e4";
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
    justify-items: center;
    aspect-ratio: 1/1;
  }

  .name {
    grid-area: n;
    align-self: end;
    font-size: 18px;
    margin-bottom: 10%;
  }

  .label {
    grid-area: l;
    align-self: start;
    font-size: 14px;
    margin-top: -10%;
    filter: opacity(40%);
  }

  .stats {
    font-size: 0.8em;
  }

  .text {
    text-overflow: ellipsis;
    white-space: nowrap;
    justify-self: start;
    overflow: hidden;
    font-weight: bold;
    margin-left: 12px;
    max-width: calc(100% - 12px);
  }

  .room {
    grid-area: r;
  }

  .icon {
    background-color: rgba(var(--color-theme), 0.05);
    height: 150%;
    width: 150%;
    align-self: center;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon ha-state-icon {
    width: 45%;
    color: rgba(var(--color-theme), 0.2);
    --mdc-icon-size: 100%;
  }

  .entity {
    width: 80%;
    height: 80%;
    place-items: center;
    cursor: pointer;
  }

  .entity-1 {
    grid-area: e1;
  }

  .entity-2 {
    grid-area: e2;
  }

  .entity-3 {
    grid-area: e3;
  }

  .entity-4 {
    grid-area: e4;
  }
`;
