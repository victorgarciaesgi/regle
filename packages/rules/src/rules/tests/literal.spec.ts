import { defineRegleConfig, useRegle, type RegleRuleDefinition, type MaybeInput } from '@regle/core';
import { literal } from '../literal';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('literal exec', () => {
  it('should not validate invalid value', () => {
    expect(literal('ONE').exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(literal('Two').exec('Two')).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(literal(4).exec(4)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(literal('ONE').exec(undefined)).toBe(true);
  });

  it('should validate undefined option', () => {
    expect(literal(undefined as any).exec(5)).toBe(true);
  });

  const literalRule = literal('Foo');
  expectTypeOf(literalRule).toEqualTypeOf<
    RegleRuleDefinition<'literal', 'Foo', [literal: 'Foo'], false, boolean, MaybeInput<'Foo'>, string | number, true>
  >();
});

describe('literal on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' as string | number }, { name: { literal: literal('active') } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'inactive';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['Value should be active.']);

    vm.r$.name.$value = 'active';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'inactive';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['Value should be active.']);

    vm.r$.name.$value = '';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = null as any;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);
  });
});

describe('literal on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          literal: withMessage(literal, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
