import { css } from 'lit';
import type { DirectiveResult } from 'lit-html/directive';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map';

import type { State } from './types';

export const getClimateStyles = (): {
  climateStyles: Record<string, string>;
  climateIcons: Record<string, string>;
} => {
  return {
    climateStyles: {
      auto: 'green',
      cool: 'blue',
      heat: 'red',
      dry: 'yellow',
      heat_cool: 'purple',
      fan_only: 'green',
      off: 'grey',
    },
    climateIcons: {
      auto: 'mdi:autorenew',
      cool: 'mdi:snowflake',
      heat: 'mdi:fire',
      dry: 'mdi:water',
      heat_cool: 'mdi:sun-snowflake',
      fan_only: 'mdi:fan',
      off: 'mdi:snowflake-off',
    },
  };
};

export const createStateStyles = (
  state: State,
): {
  cardStyle: DirectiveResult<typeof StyleMapDirective>;
  iconStyle: DirectiveResult<typeof StyleMapDirective>;
  iconContainerStyle: DirectiveResult<typeof StyleMapDirective>;
  textStyle: DirectiveResult<typeof StyleMapDirective>;
} => {
  const isActive = state.state === 'on';
  const color = state.attributes.on_color || 'yellow';

  return {
    cardStyle:
      isActive &&
      styleMap({
        'background-color': `rgba(var(--color-background-${color}),var(--opacity-bg))`,
      }),
    iconStyle:
      isActive &&
      styleMap({
        color: `rgba(var(--color-${color}),1)`,
      }),
    iconContainerStyle:
      isActive &&
      styleMap({
        'background-color': `rgba(var(--color-${color}),0.2)`,
      }),
    textStyle:
      isActive &&
      styleMap({
        color: `rgba(var(--color-${color}-text),1)`,
      }),
  };
};

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
      'n n n e1'
      'l l l e2'
      'r r . e3'
      'r r . e4';
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
    cursor: pointer;
  }

  .label {
    grid-area: l;
    align-self: start;
    font-size: 14px;
    margin-top: -10%;
    filter: opacity(40%);
    cursor: pointer;
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
    cursor: pointer;
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
    width: 50%;
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

  .status-entities {
    position: relative;
    right: 220%;
    top: 130%;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid var(--card-background-color);
    display: grid;
    place-items: center;
    color: var(--card-background-color);
  }
`;
