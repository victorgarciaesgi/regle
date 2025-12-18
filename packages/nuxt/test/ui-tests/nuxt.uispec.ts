import { expect, test } from '@nuxt/test-utils/playwright';

test('Nuxt app should be rendered correctly', async ({ goto, page }) => {
  await goto('/', { waitUntil: 'hydration' });

  const app = await page.$('#__nuxt');
  expect(await app?.textContent()).toBeDefined();

  expect(await page.$('[data-testid=name] .errors')).toBeNull();
  expect(await page.$('[data-testid=email] .errors')).toBeNull();
  expect(await page.$('[data-testid=pseudo] .errors')).toBeNull();
  expect(await page.$('[data-testid=description] .errors')).toBeNull();
  expect(await page.$('[data-testid=project-0-name] .errors')).toBeNull();
  expect(await page.$('[data-testid=project-0-price] .errors')).toBeNull();
  expect(await page.$('[data-testid=project-0-url] .errors')).toBeNull();
  expect(await page.$('[data-testid=password] .errors')).toBeNull();
  expect(await page.$('[data-testid=confirmPassword] .errors')).toBeNull();
  expect(await page.$('[data-testid=acceptTC] .errors')).toBeNull();

  // Click submit button
  (await page.$('[data-testid=submit]'))?.click();

  await page.isVisible('[data-testid=name] .errors');

  await expect(page.locator('[data-testid=name] .errors')).toContainText('You need to provide a value');
  await expect(page.locator('[data-testid=email] .errors')).toContainText('You need to provide a value');
  expect(await page.$('[data-testid=pseudo] .errors')).toBeNull();
  expect(await page.$('[data-testid=description] .errors')).toBeNull();

  await expect(page.locator('[data-testid=project-0-name] .errors')).toContainText('You need to provide a value');
  await expect(page.locator('[data-testid=project-0-price] .errors')).toContainText('You need to provide a value');
  expect(await page.$('[data-testid=project-0-url] .errors')).toBeNull();

  await expect(page.locator('[data-testid=password] .tooltips')).toContainText(
    `At least one lowercase letter (a-z)At least one uppercase letter (A-Z)At least one symbol ($€@&..)At least one number (0-9)At least 8 characters`
  );
  await expect(page.locator('[data-testid=confirmPassword] .errors')).toContainText('You need to provide a value');
  await expect(page.locator('[data-testid=acceptTC] .errors')).toContainText('You need to accept T&C');

  // Fill form

  await page.locator('[data-testid=name] input').fill('Victor');
  expect(await page.$('[data-testid=name] .errors')).toBeNull();

  await page.locator('[data-testid=email] input').fill('victor@gmail.com');
  expect(await page.$('[data-testid=email] .errors')).toBeNull();

  await page.locator('[data-testid=project-0-name] input').fill('victor');
  expect(await page.$('[data-testid=project-0-name] .errors')).toBeNull();

  await page.locator('[data-testid=project-0-price] input').fill('8');
  expect(await page.$('[data-testid=project-0-price] .errors')).toBeNull();

  await page.locator('[data-testid=password] input').fill('abcABC$$1');
  expect(await page.$('[data-testid=password] .tooltips')).toBeNull();

  await page.locator('[data-testid=confirmPassword] input').fill('abcABC$$1');
  expect(await page.$('[data-testid=confirmPassword] .errors')).toBeNull();

  await page.locator('[data-testid=acceptTC] input').check();
  expect(await page.$('[data-testid=acceptTC] .errors')).toBeNull();
});
