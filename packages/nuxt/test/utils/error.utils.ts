import { createPage, url, useTestContext } from '@nuxt/test-utils/e2e';
import { expect } from 'vitest';

// Taken from nuxt/framework repo
export async function renderPage(path = '/') {
  const ctx = useTestContext();
  if (!ctx.options.browser) {
    throw new Error('`renderPage` require `options.browser` to be set');
  }

  const page = await createPage(url(path));

  const pageErrors: Error[] = [];
  const consoleLogs: { type: string; text: string }[] = [];

  page.on('console', (message: any) => {
    consoleLogs.push({
      type: message.type(),
      text: message.text(),
    });
  });
  page.on('pageerror', (err: any) => {
    pageErrors.push(err);
  });

  if (path) {
    await page.goto(url(path), { waitUntil: 'networkidle' });
  }

  return {
    page,
    pageErrors,
    consoleLogs,
  };
}

// Taken from nuxt/framework repo
export async function expectNoClientErrors(path: string) {
  const ctx = useTestContext();
  if (!ctx.options.browser) {
    return;
  }

  const { pageErrors, consoleLogs } = (await renderPage(path))!;

  const consoleLogErrors = consoleLogs.filter((i) => i.type === 'error');
  const consoleLogWarnings = consoleLogs.filter((i) => i.type === 'warning');

  expect(pageErrors).toEqual([]);
  expect(consoleLogErrors).toEqual([]);
  expect(consoleLogWarnings).toEqual([]);
}
