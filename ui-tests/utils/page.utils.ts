import type { BrowserContext, Page } from 'playwright-core';
import { test as base } from '@playwright/test';

export class Base {
  readonly page: Page;
  readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  async goto() {
    await this.page.goto('/');
  }
}

export const test = base.extend<{ index: Base }>({
  index: [
    async ({ page, context }, use) => {
      const index = new Base(page, context);
      await use(index);
    },
    { auto: true },
  ],
});
