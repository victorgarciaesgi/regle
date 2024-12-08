import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { setup, $fetch } from '@nuxt/test-utils/e2e';
import { createResolver } from '@nuxt/kit';

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures', import.meta.url)),
  });

  it('renders the index page', async () => {
    const html = await $fetch('/');
    expect(html).toContain('<div>hello</div>');
  });
});
