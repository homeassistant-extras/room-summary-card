import { expect, test, type Locator, type Page } from '@playwright/test';

export const dashboardPath =
  process.env.PLAYWRIGHT_HA_PATH ?? '/playwright-room-summary/';

export const backgroundOpacityPath =
  process.env.PLAYWRIGHT_HA_BACKGROUND_PATH ?? dashboardPath;

/**
 * CSS custom property set via `styles.card` on each card — must match your Lovelace YAML.
 *
 * ```yaml
 * styles:
 *   card:
 *     --e2e-target: basic   # or opacity-full / opacity-icon
 * ```
 */
export const E2E_CARD_MARKER_VAR = '--e2e-target';

/** Values for `--e2e-target` in `styles.card` (pick one per card under test). */
export const E2eCardTarget = {
  basic: 'basic',
  opacityFull: 'opacity-full',
  opacityIcon: 'opacity-icon',
  slider: 'slider',
} as const;

/**
 * `room-summary-card` whose inner `ha-card` inline style includes the marker variable and value
 * (merged from `styles.card` in config).
 */
export function roomSummaryCardByE2eTarget(page: Page, markerValue: string): Locator {
  return page.locator(
    `room-summary-card:has(ha-card[style*="${E2E_CARD_MARKER_VAR}"][style*="${markerValue}"])`,
  );
}

/** Skip at collection time when no auth file (avoids launching Chromium). */
export const describeHa = process.env.PLAYWRIGHT_HA_STORAGE_STATE
  ? test.describe
  : test.describe.skip;

/**
 * Asserts a `room-state-icon` shows `entity_picture` styling: reflected `image` + `icon-bg`,
 * `--background-opacity-icon` resolved to 1, and a `::before` background-image `url(...)`.
 */
export async function expectEntityIconPictureBackground(
  roomStateIcon: Locator,
): Promise<void> {
  await expect(roomStateIcon).toHaveAttribute('image');
  await expect(roomStateIcon).toHaveAttribute('icon-bg');
  const icon = roomStateIcon.locator('.icon');
  await expect
    .poll(async () => {
      return await icon.evaluate((el: HTMLElement) => {
        const raw = getComputedStyle(el)
          .getPropertyValue('--background-opacity-icon')
          .trim();
        const n = parseFloat(raw);
        if (!Number.isNaN(n)) return n;
        return parseFloat(getComputedStyle(el, '::before').opacity);
      });
    })
    .toBeCloseTo(1, 5);
  await expect
    .poll(async () => {
      return await icon.evaluate(
        (el: HTMLElement) => getComputedStyle(el, '::before').backgroundImage,
      );
    })
    .toMatch(/url\(/);
}
