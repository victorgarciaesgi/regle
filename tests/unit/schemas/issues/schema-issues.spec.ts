import { createRegleComponent } from '../../../utils/test.utils';
import { arktypeFixture } from './fixtures/arktype.fixture';
import { valibotFixture } from './fixtures/valibot.fixture';
import { zodFixture } from './fixtures/zod.fixture';

describe('schemas (%s) - $issues ', async () => {
  it('should work with Zod', async () => {
    const { vm } = createRegleComponent(zodFixture);

    vm.r$.$value = {
      level0: 1,
      level1: {
        collection: [{ name: 1 }],
        child: 1,
        level2: {
          child: 1,
        },
      },
    };
    vm.r$.$validate();
    await vm.$nextTick();

    expect(vm.r$.level0?.$issues).toStrictEqual([
      {
        $message: 'Custom error',
        $property: 'level0',
        $rule: 'schema',
        code: 'custom',
        message: 'Custom error',
        path: ['level0'],
      },
    ]);
    expect(vm.r$.level0?.$issues).toStrictEqual([
      {
        $message: 'Custom error',
        $property: 'level0',
        $rule: 'schema',
        code: 'custom',
        message: 'Custom error',
        path: ['level0'],
      },
    ]);

    expect(vm.r$.$fields.level1.$fields.child?.$issues).toStrictEqual([
      {
        $message: 'Custom error',
        $property: 'child',
        $rule: 'schema',
        code: 'custom',
        message: 'Custom error',
        path: ['level1', 'child'],
      },
    ]);

    expect(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name.$issues).toStrictEqual([
      {
        $message: 'Custom error',
        $property: 'name',
        $rule: 'schema',
        code: 'custom',
        message: 'Custom error',
        path: ['level1', 'collection', 0, 'name'],
      },
    ]);
    expect(vm.r$.level1.collection.$each[0].name.$issues).toStrictEqual([
      {
        $message: 'Custom error',
        $property: 'name',
        $rule: 'schema',
        code: 'custom',
        message: 'Custom error',
        path: ['level1', 'collection', 0, 'name'],
      },
    ]);
  });

  it('should work with Valibot', async () => {
    const { vm } = createRegleComponent(valibotFixture);

    vm.r$.$value = {
      level0: 1,
      level1: {
        collection: [{ name: 1 }],
        child: 1,
        level2: {
          child: 1,
        },
      },
    };
    vm.r$.$validate();
    await vm.$nextTick();

    expect(vm.r$.$fields.level0?.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'level0',
        $rule: 'schema',
        message: 'Custom error',
      })
    );

    expect(vm.r$.$fields.level1.$fields.child?.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'child',
        $rule: 'schema',
        message: 'Custom error',
      })
    );

    expect(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'name',
        $rule: 'schema',
        message: 'Custom error',
      })
    );

    expect(vm.r$.level1.collection.$each[0].name.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'name',
        $rule: 'schema',
        message: 'Custom error',
      })
    );
  });

  it('should work with Arktype', async () => {
    const { vm } = createRegleComponent(arktypeFixture);

    vm.r$.$value = {
      level0: 1,
      level1: {
        collection: [{ name: 1 }],
        child: 1,
        level2: {
          child: 1,
        },
      },
    };
    vm.r$.$validate();
    await vm.$nextTick();

    expect(vm.r$.level0?.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'level0',
        $rule: 'schema',
        message: 'Custom error',
      })
    );

    expect(vm.r$.level1.child?.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'child',
        $rule: 'schema',
        message: 'Custom error',
      })
    );

    expect(vm.r$.level1.collection.$each[0].name.$issues[0]).toMatchObject(
      expect.objectContaining({
        $message: 'Custom error',
        $property: 'name',
        $rule: 'schema',
        message: 'Custom error',
      })
    );
  });
});
