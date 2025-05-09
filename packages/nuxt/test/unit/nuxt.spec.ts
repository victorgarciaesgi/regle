import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { setup, createPage } from '@nuxt/test-utils/e2e';
import { expectNoClientErrors } from '../utils/error.utils';

describe('Nuxt SSR', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../fixtures', import.meta.url)),
    dev: true,
  });

  it('renders the index page', async () => {
    await expectNoClientErrors('/');

    const page = await createPage('/');

    expect(await page.getByTestId('acceptTC-checkbox').isVisible()).toBe(true);

    await page.getByTestId('field-fullName').fill('foo');
    await page.getByTestId('field-fullName').fill('');

    expect(await page.getByTestId('field-fullName-errors').textContent()).toBe(`Custom Nuxt error`);
  });
});
