import { expect, test } from '@nuxt/test-utils/playwright';

test('Nuxt app', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' });

  await expect(await page.getByTestId('acceptTC-checkbox').isVisible()).toBe(true);

  await page.getByTestId('field-fullName').fill('foo');
  await page.getByTestId('field-fullName').fill('');

  await expect(await page.getByTestId('field-fullName-errors').textContent()).toBe(`Custom Nuxt error`);
});
