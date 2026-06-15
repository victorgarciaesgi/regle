import type { BrowserContext, Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

const DEVTOOLS_PATH = '/__devtools__/';
const INSPECTOR_TAB = 'regle-inspector';

const TREE_FILTER = 'Filter state';
const STATE_FILTER = 'Filter validation status';

/** Icon index in the inspector toolbar (0 is the global "log version" action). */
const NODE_ACTION_INDEX = {
  validate: 1,
  touch: 2,
  reset: 3,
  restore: 4,
} as const;

export type RegleNodeAction = keyof typeof NODE_ACTION_INDEX;

/** Click to select a node, or double-click to expand its children. */
export type RegleTreeStep = string | { expand: string };

export interface RegleDevtoolsHarness {
  path: string;
  readyTestId: string;
  instanceId: string;
}

export const REGLE_DEVTOOLS_HARNESSES = {
  basic: {
    path: '/devtools',
    readyTestId: 'devtools-name',
    instanceId: 'playwright-devtools-form',
  },
  nested: {
    path: '/devtools/nested',
    readyTestId: 'nested-email',
    instanceId: 'playwright-devtools-nested',
  },
  collection: {
    path: '/devtools/collection',
    readyTestId: 'collection-item-name',
    instanceId: 'playwright-devtools-collection',
  },
  self: {
    path: '/devtools/self',
    readyTestId: 'self-user-invalid',
    instanceId: 'playwright-devtools-self',
  },
} as const satisfies Record<string, RegleDevtoolsHarness>;

export interface RegleDevtoolsSession {
  appPage: Page;
  inspector: RegleInspector;
}

function inspectorPane(page: Page, filterPlaceholder: string): Locator {
  return page.getByPlaceholder(filterPlaceholder).locator('xpath=ancestor::div[contains(@class,"flex-col")][1]');
}

export function regleInstanceLabel(instanceId: string) {
  return `r$ #${instanceId}`;
}

export class RegleInspector {
  readonly tree: Locator;
  readonly state: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.tree = inspectorPane(page, TREE_FILTER);
    this.state = inspectorPane(page, STATE_FILTER);
  }

  node(label: string): Locator {
    if (label.startsWith('r$ #')) {
      return this.tree.getByText(label);
    }

    return this.tree.getByText(label, { exact: true });
  }

  async waitForInstance(instanceId: string) {
    await this.page.waitForSelector(`text=${regleInstanceLabel(instanceId)}`);
  }

  async selectNode(label: string) {
    await this.node(label).first().click();
  }

  async expandNode(label: string) {
    await this.node(label).first().dblclick();
  }

  /** Walk the inspector tree: strings select a node, `{ expand }` reveals children. */
  async navigate(...steps: RegleTreeStep[]) {
    for (const step of steps) {
      if (typeof step === 'string') {
        await this.selectNode(step);
        continue;
      }

      await this.expandNode(step.expand);
    }
  }

  async expectNodeVisible(label: string) {
    await expect(this.node(label)).toBeVisible();
  }

  async expectTagVisible(tag: string) {
    await expect(this.tree.getByText(tag, { exact: true })).toBeVisible();
  }

  async expectState(key: string, value: string | boolean) {
    const escapedKey = key.replace(/\$/g, '\\$');
    await expect(this.state).toContainText(new RegExp(`${escapedKey}:${value}`));
  }

  async clickNodeAction(action: RegleNodeAction) {
    const actionButton = this.page.locator('.custom-svg').nth(NODE_ACTION_INDEX[action]);
    await actionButton.waitFor({ state: 'visible' });
    await actionButton.click();
  }
}

export async function openRegleDevtools(
  context: BrowserContext,
  harness: RegleDevtoolsHarness = REGLE_DEVTOOLS_HARNESSES.basic
): Promise<RegleDevtoolsSession> {
  const appPage = await context.newPage();
  await appPage.goto(harness.path);
  await appPage.waitForSelector(`[data-testid="${harness.readyTestId}"]`);

  const devtoolsPage = await context.newPage();
  await devtoolsPage.goto(DEVTOOLS_PATH);
  await devtoolsPage.getByRole('link', { name: INSPECTOR_TAB }).click();

  const inspector = new RegleInspector(devtoolsPage);
  await inspector.waitForInstance(harness.instanceId);

  return { appPage, inspector };
}
