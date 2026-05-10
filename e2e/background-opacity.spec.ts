import { expect, test } from '@playwright/test';

import {
  backgroundOpacityPath,
  describeHa,
  E2eCardTarget,
  expectEntityIconPictureBackground,
  roomSummaryCardByE2eTarget,
} from './helpers';

/**
 * Fixture (Lovelace): markdown section titled `Background & Opacity`, then two `room-summary-card`s:
 *
 * 1) Full card background — `opacity: 90` (card overlay, not icon_background)
 * 2) Icon-only background — `icon_background`, `hide_icon_only`, `opacity: 30` (main entity `.icon::before`)
 *
 * Entity grid: first `entity-collection` icon should be an “on” `media_player` with `entity_picture` (same as basic e2e `expectEntityIconPictureBackground`).
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

    const firstEntityIcon = fullCardBg
      .locator('entity-collection')
      .locator('room-state-icon')
      .first();
    await expectEntityIconPictureBackground(firstEntityIcon);

    await expect(fullCardBg).toHaveAttribute('image');
    await expect(fullCardBg.locator('room-state-icon[room]')).toHaveAttribute(
      'image',
    );
    await expect(
      fullCardBg.locator('room-state-icon[room]'),
    ).not.toHaveAttribute('icon-bg');
    await expect(iconBgCard.locator('room-state-icon[room]')).toHaveAttribute(
      'icon-bg',
    );

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
