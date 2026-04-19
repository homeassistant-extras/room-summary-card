import { expect, test, type Page } from '@playwright/test';

import {
  dashboardPath,
  describeHa,
  E2eCardTarget,
  expectEntityIconPictureBackground,
  roomSummaryCardByE2eTarget,
} from './helpers';
import { expectMoreInfoMainLabel } from './more-info';

/** ms between pointer down/up — Home Assistant treats this as hold vs tap */
const holdDelayMs = 1000;

/**
 * Tag the card under test in Lovelace (`PLAYWRIGHT_HA_PATH`):
 *
 * ```yaml
 * styles:
 *   card:
 *     --e2e-target: basic
 * ```
 */

/**
 * Display title — must match the configured area/display name on that dashboard.
 */
const expectedCardTitle = 'Dining Room';

function basicRoomCard(page: Page) {
  return roomSummaryCardByE2eTarget(page, E2eCardTarget.basic);
}

describeHa('HA dashboard — room-summary-card', () => {
  test('renders title, stats, climate row, and entity grid', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    const card = basicRoomCard(page);
    await expect(card).toBeVisible();

    await expect(card.locator('.name')).toHaveText(expectedCardTitle);

    await expect(card.locator('.stats')).toHaveText(
      /\d+\s+devices\s+\d+\s+entities/i,
    );

    const sensors = card.locator('sensor-collection .sensor');
    await expect(sensors).toHaveCount(2);

    await expect(sensors.first()).toContainText(/[\d.]+\s*°[FC]/);
    await expect(sensors.last()).toContainText(/[\d.]+\s*%/);

    await expect(card.locator('.grid > room-state-icon')).toHaveCount(1);
    const sideIcons = card
      .locator('entity-collection')
      .locator('room-state-icon');
    await expect(sideIcons).toHaveCount(4);

    // Third / fourth: person + media_player — entity_picture background + opacity
    await expectEntityIconPictureBackground(sideIcons.nth(2));
    await expectEntityIconPictureBackground(sideIcons.nth(3));
  });

  test('climate sensor (first) opens more-info — Air temperature', async ({
    page,
  }) => {
    await page.goto(dashboardPath);
    const card = basicRoomCard(page);
    await expect(card).toBeVisible();
    await card.locator('sensor-collection .sensor').nth(0).click();
    await expectMoreInfoMainLabel(page, 'Air temperature');
  });

  test('climate sensor (second) opens more-info — Humidity', async ({
    page,
  }) => {
    await page.goto(dashboardPath);
    const card = basicRoomCard(page);
    await expect(card).toBeVisible();
    await card.locator('sensor-collection .sensor').nth(1).click();
    await expectMoreInfoMainLabel(page, 'Humidity');
  });

  test('main room icon long-press opens more-info — Dining Room Light', async ({
    page,
  }) => {
    await page.goto(dashboardPath);
    const card = basicRoomCard(page);
    await expect(card).toBeVisible();
    await card
      .locator('room-state-icon[room] .icon')
      .click({ delay: holdDelayMs });
    await expectMoreInfoMainLabel(page, 'Dining Room Light');
  });

  test('first side entity icon long-press opens more-info — Dining Room Light', async ({
    page,
  }) => {
    await page.goto(dashboardPath);
    const card = basicRoomCard(page);
    await expect(card).toBeVisible();
    await card
      .locator('entity-collection room-state-icon .icon')
      .nth(0)
      .click({ delay: holdDelayMs });
    await expectMoreInfoMainLabel(page, 'Dining Room Light');
  });

  test('second side entity icon long-press opens more-info — Dining Room Fan', async ({
    page,
  }) => {
    await page.goto(dashboardPath);
    const card = basicRoomCard(page);
    await expect(card).toBeVisible();
    await card
      .locator('entity-collection room-state-icon .icon')
      .nth(1)
      .click({ delay: holdDelayMs });
    await expectMoreInfoMainLabel(page, 'Dining Room Fan');
  });
});
