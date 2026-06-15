import { expect, test } from '@playwright/test';
import { openRegleDevtools, regleInstanceLabel } from '../utils/devtools.utils';

test.describe('Regle devtools', () => {
  test('shows the regle instance and fields in the Vue Devtools inspector', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context);

    await expect(inspector.page.getByText(regleInstanceLabel('playwright-devtools-form'))).toBeVisible();
    await inspector.expectNodeVisible('name');
    await inspector.expectTagVisible('invalid');
  });

  test('displays field state in the inspector panel', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context);

    await inspector.selectNode('name');

    await inspector.expectState('$invalid', 'true');
    await inspector.expectState('$dirty', 'false');
  });

  test('marks the field dirty from the devtools validate action', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context);

    await inspector.selectNode('name');
    await inspector.clickNodeAction('validate');

    await expect(appPage.getByTestId('devtools-name-dirty')).toHaveText('true');
    await inspector.expectState('$dirty', 'true');
  });

  test('marks the field dirty from the devtools touch action', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context);

    await inspector.selectNode('name');
    await inspector.clickNodeAction('touch');

    await expect(appPage.getByTestId('devtools-name-dirty')).toHaveText('true');
    await inspector.expectState('$dirty', 'true');
  });

  test('reflects app edits in the devtools inspector tree', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context);

    await appPage.getByTestId('devtools-name').fill('Victor');

    await expect(appPage.getByTestId('devtools-name-dirty')).toHaveText('true');
    await inspector.selectNode('name');
    await inspector.expectState('$dirty', 'true');
    await inspector.expectState('$invalid', 'false');
  });
});
