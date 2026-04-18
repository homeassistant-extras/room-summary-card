import { expect, test, type Locator } from '@playwright/test';

export const dashboardPath =
  process.env.PLAYWRIGHT_HA_PATH ?? '/playwright-room-summary/';

export const backgroundOpacityPath =
  process.env.PLAYWRIGHT_HA_BACKGROUND_PATH ?? dashboardPath;

/** 0-based — see Background & Opacity fixture doc in background-opacity.spec.ts */
export const BG_FULL_CARD_INDEX = 1;
export const BG_ICON_CARD_INDEX = 2;

/** Skip at collection time when no auth file (avoids launching Chromium). */
export const describeHa = process.env.PLAYWRIGHT_HA_STORAGE_STATE
  ? test.describe
  : test.describe.skip;

/**
 * Parse the markdown card that sits above a room-summary-card.
 * Expected markdown structure:
 *   # <Title>
 *   ```
 *   type: custom:room-summary-card
 *   area: <area_id>
 *
 *   <Display Title>
 *   <N> devices <M> entities
 *   <temp> °F <humidity> %
 *   ```
 */
export function parseExpectedCard(text: string) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const areaIdx = lines.findIndex((l) => l.startsWith('area:'));
  const dataLines = lines.slice(areaIdx + 1);

  const title = dataLines[0] ?? '';

  const statsMatch = dataLines[1]?.match(/(\d+)\s+devices\s+(\d+)\s+entities/i);
  const devices = statsMatch ? Number(statsMatch[1]) : NaN;
  const entities = statsMatch ? Number(statsMatch[2]) : NaN;

  const climateMatch = dataLines[2]?.match(/([\d.]+)\s*°[FC]\s+([\d.]+)\s*%/);
  const temp = climateMatch ? climateMatch[1] : undefined;
  const humidity = climateMatch ? climateMatch[2] : undefined;

  return { title, devices, entities, temp, humidity };
}

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
