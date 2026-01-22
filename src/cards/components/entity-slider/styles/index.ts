import { css } from 'lit';
import { barStyle } from './bar';
import { barFilledStyle } from './bar-filled';
import { baseStyles } from './base';
import { dotsStyle } from './dots';
import { dualRailStyle } from './dual-rail';
import { filledStyle } from './filled';
import { glowStyle } from './glow';
import { gradientStyle } from './gradient';
import { gridStyle } from './grid';
import { lineStyle } from './line';
import { notchedStyle } from './notched';
import { outlinedStyle } from './outlined';
import { shadowTrailStyle } from './shadow-trail';
import { trackStyle } from './track';

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
  ${barFilledStyle}
`;
