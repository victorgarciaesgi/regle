import { expect } from '@playwright/test';
import { test } from '../utils/page.utils';

test('it should render the page correctly', async ({ index }) => {
  await index.goto();

  const app = await index.page.$('#app');
  expect(await app?.textContent()).toBe('Hello');
});
