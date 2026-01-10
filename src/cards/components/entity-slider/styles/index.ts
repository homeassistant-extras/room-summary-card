import { css } from 'lit';
import { baseStyles } from './base';
import { trackStyle } from './track';
import { lineStyle } from './line';
import { filledStyle } from './filled';
import { gradientStyle } from './gradient';
import { dualRailStyle } from './dual-rail';
import { dotsStyle } from './dots';
import { notchedStyle } from './notched';
import { gridStyle } from './grid';
import { glowStyle } from './glow';
import { shadowTrailStyle } from './shadow-trail';
import { outlinedStyle } from './outlined';
import { barStyle } from './bar';

/**
 * Combined styles for the entity slider component
 * Includes base styles and all slider style variants
 */
export const styles = css`
  ${baseStyles}
  ${trackStyle}
  ${lineStyle}
  ${filledStyle}
  ${gradientStyle}
  ${dualRailStyle}
  ${dotsStyle}
  ${notchedStyle}
  ${gridStyle}
  ${glowStyle}
  ${shadowTrailStyle}
  ${outlinedStyle}
  ${barStyle}
`;
