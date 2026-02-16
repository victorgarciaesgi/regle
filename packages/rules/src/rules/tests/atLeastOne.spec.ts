import { defineRegleConfig, useRegle } from '@regle/core';
import { atLeastOne } from '../atLeastOne';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';

describe('atLeastOne exec', () => {
  it('should validate at least one key', () => {
    expect(atLeastOne.exec({ firstName: 'John', lastName: 'Doe' })).toBe(true);
    expect(atLeastOne.exec({ firstName: 'John' })).toBe(true);
    expect(atLeastOne.exec({ lastName: 'Doe' })).toBe(true);
    expect(atLeastOne.exec({})).toBe(false);
    expect(atLeastOne.exec(undefined)).toBe(true);
  });

  it('should check keys if arguments are provided', () => {
    expect(
      atLeastOne(['firstName', 'lastName']).exec({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' })
    ).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ firstName: 'John' })).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ lastName: 'Doe' })).toBe(true);
    expect(atLeastOne(['firstName', 'lastName']).exec({ email: 'john.doe@example.com' })).toBe(false);
    expect(atLeastOne(['firstName', 'lastName']).exec(undefined)).toBe(true);
  });
});

describe('atLeastOne on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle(
        { data: {} as { name: string } | undefined, unknownObject: {} as Record<string, unknown> },
        { data: { $self: { atLeastOne } }, unknownObject: { $self: { atLeastOne } } }
      );
    }
    const { vm } = createRegleComponent(formComponent);

    await vm.r$.$validate();
    await nextTick();

    expect(vm.r$.unknownObject.$error).toBe(true);
    expect(vm.r$.data.$error).toBe(true);
    expect(vm.r$.unknownObject.$self.$errors).toStrictEqual(['At least one item is required']);
    expect(vm.r$.data.$self.$errors).toStrictEqual(['At least one item is required']);

    vm.r$.data.$value = { name: 'John' };
    await nextTick();
    expect(vm.r$.data.$error).toBe(false);

    vm.r$.data.$value = undefined as any;
    await nextTick();
    expect(vm.r$.data.$error).toBe(false);

    vm.r$.data.$value = null as any;
    await nextTick();
    expect(vm.r$.data.$error).toBe(false);
  });
});

describe('atLeastOne on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          atLeastOne: withMessage(atLeastOne, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
