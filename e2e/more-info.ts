import { expect, type Page } from '@playwright/test';

/**
 * Asserts more-info opened with the expected `p.main` label. Does not close the dialog.
 */
export async function expectMoreInfoMainLabel(
  page: Page,
  label: string | RegExp,
): Promise<void> {
  const dialog = page.locator('ha-more-info-dialog');
  const title = dialog.locator('ha-adaptive-dialog span.title');

  await expect(title).toBeVisible({ timeout: 15_000 });
  await expect(title.locator('p.main')).toHaveText(label);
}
