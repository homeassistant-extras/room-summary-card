import { expect, test, type Locator } from '@playwright/test';

import {
  dashboardPath,
  describeHa,
  E2eCardTarget,
  roomSummaryCardByE2eTarget,
} from './helpers';

/**
 * Reads the rendered icon name of every `room-state-icon` in `scope`.
 * `ha-state-icon` / `ha-icon` don't reflect the `icon` property to an
 * attribute, so we have to read it from the live element.
 */
async function renderedIconNames(scope: Locator): Promise<string[]> {
  return scope
    .locator('room-state-icon')
    .evaluateAll<string[], HTMLElement>((nodes) =>
      nodes.map((node) => {
        const raw = node.shadowRoot?.querySelector('ha-state-icon');
        if (!raw) return '';
        const haStateIcon = raw as HTMLElement & {
          icon?: string;
          stateObj?: { attributes?: { icon?: string } };
        };
        return haStateIcon.icon ?? haStateIcon.stateObj?.attributes?.icon ?? '';
      }),
    );
}

/**
 * Fixture (Lovelace): two `room-summary-card`s on the dashboard at
 * `PLAYWRIGHT_HA_PATH`. The `input_number.test` helper is configured
 * with an `mdi:test-tube` icon, so we can check whether it appears
 * in the icon grid.
 *
 * 1) `basic` card — slider entity has `hide_icon: true` so the
 *    `mdi:test-tube` icon must NOT appear in the side icon grid;
 *    the `<horizontal-slider>` strip should still render in the
 *    `'ha'` style.
 * 2) `slider` card — only the slider entity is configured (no
 *    `hide_icon`), so the `mdi:test-tube` icon DOES appear AND
 *    the strip renders in the default `'bar'` style.
 *
 * ```yaml
 * - type: custom:room-summary-card
 *   area: dining_room
 *   entities:
 *     - person.gina
 *     - media_player.office_tv
 *     - entity_id: input_number.test
 *       slider:
 *         hide_icon: true
 *         style: ha
 *   styles:
 *     card:
 *       --e2e-target: basic
 * - type: custom:room-summary-card
 *   area: dining_room
 *   entities:
 *     - entity_id: input_number.test
 *       slider: {}
 *   styles:
 *     card:
 *       --e2e-target: slider
 * ```
 */
describeHa('Horizontal Slider', () => {
  test('basic card: slider visible in `ha` style and mdi:test-tube is hidden from icon grid', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    const card = roomSummaryCardByE2eTarget(page, E2eCardTarget.basic);
    await expect(card).toBeVisible();

    const slider = card.locator('horizontal-slider');
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('style', /ha/);
    await expect(slider.locator('ha-slider')).toBeVisible();

    // hide_icon: true → input_number.test (mdi:test-tube) must NOT
    // appear as a room-state-icon in the side grid.
    const sideCollection = card.locator('entity-collection');
    await expect(sideCollection.locator('room-state-icon')).toHaveCount(4);

    await expect
      .poll(async () => renderedIconNames(sideCollection))
      .not.toContain('mdi:test-tube');
  });

  test('slider card: bar slider visible and mdi:test-tube renders in icon grid', async ({
    page,
  }) => {
    await page.goto(dashboardPath);

    const card = roomSummaryCardByE2eTarget(page, E2eCardTarget.slider);
    await expect(card).toBeVisible();

    const slider = card.locator('horizontal-slider');
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('style', /bar/);
    await expect(slider.locator('ha-slider')).toBeVisible();

    // No `hide_icon` → input_number.test should still render as the
    // sole room-state-icon, displaying its `mdi:test-tube` icon.
    const sideCollection = card.locator('entity-collection');
    await expect(sideCollection.locator('room-state-icon')).toHaveCount(3);

    await expect
      .poll(async () => renderedIconNames(sideCollection))
      .toContain('mdi:test-tube');
  });
});
