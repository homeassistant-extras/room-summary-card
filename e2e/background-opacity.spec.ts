import { expect, test } from '@playwright/test';

import {
  backgroundOpacityPath,
  describeHa,
  E2eCardTarget,
  roomSummaryCardByE2eTarget,
} from './helpers';

/**
 * Fixture (Lovelace): markdown section titled `Background & Opacity`, then two `room-summary-card`s:
 *
 * 1) Full card background — `opacity: 90` (card overlay, not icon_background)
 * 2) Icon-only background — `icon_background`, `hide_icon_only`, `opacity: 30` (main entity `.icon::before`)
 *
 * ```yaml
 * - type: custom:room-summary-card
 *   area: dining_room
 *   styles:
 *     card:
 *       --e2e-target: opacity-full
 *   background:
 *     image_entity: person.gina
 *     opacity: 90
 * - type: custom:room-summary-card
 *   area: dining_room
 *   styles:
 *     card:
 *       --e2e-target: opacity-icon
 *   background:
 *     image_entity: person.gina
 *     options:
 *       - icon_background
 *       - hide_icon_only
 *     opacity: 30
 * ```
 */
describeHa('Background & Opacity', () => {
  test('card background opacity 90; icon_background main icon opacity 30', async ({
    page,
  }) => {
    await page.goto(backgroundOpacityPath);

    const fullCardBg = roomSummaryCardByE2eTarget(
      page,
      E2eCardTarget.opacityFull,
    );
    const iconBgCard = roomSummaryCardByE2eTarget(
      page,
      E2eCardTarget.opacityIcon,
    );

    await expect(fullCardBg).toBeVisible();
    await expect(iconBgCard).toBeVisible();
    await expect(fullCardBg).toHaveAttribute('image');
    await expect(fullCardBg).not.toHaveAttribute('icon-bg');
    await expect(iconBgCard).toHaveAttribute('icon-bg');

    await expect
      .poll(async () => {
        return await fullCardBg
          .locator('ha-card')
          .evaluate((haCard) =>
            parseFloat(getComputedStyle(haCard, '::before').opacity),
          );
      })
      .toBeCloseTo(0.9, 5);

    await expect
      .poll(async () => {
        return await iconBgCard
          .locator('room-state-icon[room] .icon')
          .evaluate((icon) => {
            const raw = getComputedStyle(icon)
              .getPropertyValue('--background-opacity-icon')
              .trim();
            return parseFloat(raw);
          });
      })
      .toBeCloseTo(0.3, 5);
  });
});
