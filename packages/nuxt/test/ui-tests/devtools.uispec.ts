import { expect, test } from '@nuxt/test-utils/playwright';

test('serves the Regle Nuxt DevTools client when built', async ({ goto, page }) => {
  test.skip(!process.env.REGLE_DEVTOOLS_E2E, 'Set REGLE_DEVTOOLS_E2E=1 to run Nuxt DevTools client tests');

  await goto('/__regle', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('body')).toContainText(/Regle|Connecting/i);
});
