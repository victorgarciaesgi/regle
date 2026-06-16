import { expect, test } from '@playwright/test';
import {
  openRegleDevtools,
  REGLE_DEVTOOLS_HARNESSES,
  regleInstanceIndexLabel,
  regleInstanceLabel,
} from '../utils/devtools.utils';

test.describe('Regle devtools nested forms', () => {
  test('shows nested fields in the inspector tree', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.nested);

    await expect(inspector.page.getByText(regleInstanceLabel('playwright-devtools-nested'))).toBeVisible();
    await inspector.expectNodeVisible('profile');
    await inspector.expectNodeVisible('email');
    await inspector.expandNode('email');
    await inspector.expectTagVisible('invalid');
  });

  test('displays nested field state in the inspector panel', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.nested);

    await inspector.selectNode('email');

    await inspector.expectState('$invalid', 'true');
    await inspector.expectState('$dirty', 'false');
  });

  test('reflects nested field edits in the devtools inspector', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.nested);

    await appPage.getByTestId('nested-email').fill('john@example.com');

    await expect(appPage.getByTestId('nested-email-invalid')).toHaveText('false');
    await inspector.selectNode('email');
    await inspector.expectState('$invalid', 'false');
    await inspector.expectState('$dirty', 'true');
  });
});

test.describe('Regle devtools collections', () => {
  test('shows collection items in the inspector tree', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.collection);

    await expect(inspector.page.getByText(regleInstanceLabel('playwright-devtools-collection'))).toBeVisible();
    await inspector.expectNodeVisible('items[1]');
    await inspector.expectNodeVisible('$self');
    await inspector.expectNodeVisible('[0]');
    await inspector.expandNode('[0]');
    await inspector.expectNodeVisible('name');
  });

  test('displays collection item field state in the inspector panel', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.collection);

    await inspector.navigate('items[1]', { expand: '[0]' }, 'name');

    await inspector.expectState('$invalid', 'true');
    await inspector.expectState('$dirty', 'false');
  });

  test('displays collection $self validation state in the inspector panel', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.collection);

    await inspector.selectNode('$self');

    await inspector.expectState('$invalid', 'true');
    await inspector.expectState('$dirty', 'false');
  });

  test('reflects collection item edits in the devtools inspector', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.collection);

    await appPage.getByTestId('collection-item-name').fill('Widget');

    await expect(appPage.getByTestId('collection-item-invalid')).toHaveText('false');
    await inspector.navigate('items[1]', { expand: '[0]' }, 'name');
    await inspector.expectState('$invalid', 'false');
    await inspector.expectState('$dirty', 'true');
  });
});

test.describe('Regle devtools object $self validation', () => {
  test('shows object $self node in the inspector tree', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.self);

    await expect(inspector.page.getByText(regleInstanceLabel('playwright-devtools-self'))).toBeVisible();
    await inspector.expectNodeVisible('user');
    await inspector.expectNodeVisible('$self');
    await inspector.expandNode('$self');
    await inspector.expectTagVisible('invalid');
  });

  test('displays object $self validation state in the inspector panel', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.self);

    await inspector.selectNode('$self');

    await inspector.expectState('$invalid', 'true');
    await inspector.expectState('$dirty', 'false');
  });

  test('reflects object $self edits in the devtools inspector', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.self);

    await appPage.getByTestId('self-set-user').click();

    await expect(appPage.getByTestId('self-user-invalid')).toHaveText('false');
    await expect(appPage.getByTestId('self-user-self-invalid')).toHaveText('false');
    await inspector.selectNode('$self');
    await inspector.expectState('$invalid', 'false');
    await inspector.expectState('$dirty', 'true');
  });
});

test.describe('Regle devtools dynamic instance ids', () => {
  test('shows a single incremental id for the initial form', async ({ context }) => {
    const { inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.dynamic);

    await expect(inspector.page.getByText(regleInstanceIndexLabel(1))).toBeVisible();
    await inspector.expectInstanceIndexCount(1, 1);
  });

  test('keeps unique incremental ids when the same form component is added again', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.dynamic);

    await appPage.getByTestId('dynamic-add-form-a').click();
    await inspector.waitForInstanceIndex(2);

    await inspector.expectInstanceIndexCount(1, 1);
    await inspector.expectInstanceIndexCount(2, 1);
  });

  test('keeps unique incremental ids when a different form component is added', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.dynamic);

    await appPage.getByTestId('dynamic-add-form-b').click();
    await inspector.waitForInstanceIndex(2);

    await inspector.expectInstanceIndexCount(1, 1);
    await inspector.expectInstanceIndexCount(2, 1);
  });

  test('continues incrementing ids when multiple forms are added dynamically', async ({ context }) => {
    const { appPage, inspector } = await openRegleDevtools(context, REGLE_DEVTOOLS_HARNESSES.dynamic);

    await appPage.getByTestId('dynamic-add-form-a').click();
    await appPage.getByTestId('dynamic-add-form-b').click();
    await inspector.waitForInstanceIndex(3);

    await inspector.expectInstanceIndexCount(1, 1);
    await inspector.expectInstanceIndexCount(2, 1);
    await inspector.expectInstanceIndexCount(3, 1);
  });
});
