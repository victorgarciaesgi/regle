import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { setup, $fetch } from '@nuxt/test-utils/e2e';

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures', import.meta.url)),
    dev: true,
  });

  it('renders the index page', async () => {
    const html = await $fetch('/');
    expect(html).toContain('<div>Hello</div>');
  });
});
