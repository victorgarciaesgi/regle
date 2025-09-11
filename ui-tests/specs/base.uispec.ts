import { expect } from '@playwright/test';
import { test } from '../utils/page.utils';

test('it should render the page correctly', async ({ index }) => {
  await index.goto();

  const app = await index.page.$('#app');
  expect(await app?.textContent()).toBeDefined();

  expect(await index.page.$('[data-testid=name] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=email] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=pseudo] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=description] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=project-0-name] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=project-0-price] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=project-0-url] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=password] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=confirmPassword] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=acceptTC] .errors')).toBeNull();

  // Click submit button
  (await index.page.$('[data-testid=submit]'))?.click();

  await index.page.isVisible('[data-testid=name] .errors');

  await expect(index.page.locator('[data-testid=name] .errors')).toContainText('You need to provide a value');
  await expect(index.page.locator('[data-testid=email] .errors')).toContainText('You need to provide a value');
  expect(await index.page.$('[data-testid=pseudo] .errors')).toBeNull();
  expect(await index.page.$('[data-testid=description] .errors')).toBeNull();

  await expect(index.page.locator('[data-testid=project-0-name] .errors')).toContainText('You need to provide a value');
  await expect(index.page.locator('[data-testid=project-0-price] .errors')).toContainText(
    'You need to provide a value'
  );
  expect(await index.page.$('[data-testid=project-0-url] .errors')).toBeNull();

  await expect(index.page.locator('[data-testid=password] .tooltips')).toContainText(
    `At least one lowercase letter (a-z)At least one uppercase letter (A-Z)At least one symbol ($€@&..)At least one number (0-9)At least 8 characters`
  );
  await expect(index.page.locator('[data-testid=confirmPassword] .errors')).toContainText(
    'You need to provide a value'
  );
  await expect(index.page.locator('[data-testid=acceptTC] .errors')).toContainText('You need to accept T&C');

  // Fill form

  await index.page.locator('[data-testid=name] input').fill('Victor');
  expect(await index.page.$('[data-testid=name] .errors')).toBeNull();

  await index.page.locator('[data-testid=email] input').fill('victor@gmail.com');
  expect(await index.page.$('[data-testid=email] .errors')).toBeNull();

  await index.page.locator('[data-testid=project-0-name] input').fill('victor');
  expect(await index.page.$('[data-testid=project-0-name] .errors')).toBeNull();

  await index.page.locator('[data-testid=project-0-price] input').fill('8');
  expect(await index.page.$('[data-testid=project-0-price] .errors')).toBeNull();

  await index.page.locator('[data-testid=password] input').fill('abcABC$$1');
  expect(await index.page.$('[data-testid=password] .tooltips')).toBeNull();

  await index.page.locator('[data-testid=confirmPassword] input').fill('abcABC$$1');
  expect(await index.page.$('[data-testid=confirmPassword] .errors')).toBeNull();

  await index.page.locator('[data-testid=acceptTC] input').check();
  expect(await index.page.$('[data-testid=acceptTC] .errors')).toBeNull();
});
