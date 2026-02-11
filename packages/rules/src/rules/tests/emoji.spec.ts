import { defineRegleConfig, useRegle } from '@regle/core';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { withMessage } from '../..';
import { emoji } from '../emoji';

describe('emoji exec', () => {
  it('should validate undefined', () => {
    expect(emoji.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(emoji.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(emoji.exec('')).toBe(true);
  });

  it('should validate single emoji', () => {
    expect(emoji.exec('😀')).toBe(true);
  });

  it('should validate multiple emojis', () => {
    expect(emoji.exec('🔥💯')).toBe(true);
  });

  it('should validate complex emoji (family)', () => {
    expect(emoji.exec('👨‍👩‍👧‍👦')).toBe(true);
  });

  it('should not validate text', () => {
    expect(emoji.exec('hello')).toBe(false);
  });

  it('should not validate mixed content', () => {
    expect(emoji.exec('hello 😀')).toBe(false);
  });

  it('should validate digit emoji components', () => {
    // Digits are valid emoji components (used in keycap emojis)
    expect(emoji.exec('123')).toBe(true);
  });
});

describe('emoji on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ name: '' }, { name: { emoji } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value should be a valid emoji']);

    vm.r$.name.$value = '😀';
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = undefined;
    await nextTick();
    expect(vm.r$.name.$error).toBe(false);
    expect(vm.r$.name.$errors).toStrictEqual([]);

    vm.r$.name.$value = 'hello';
    await nextTick();
    expect(vm.r$.name.$error).toBe(true);
    expect(vm.r$.name.$errors).toStrictEqual(['The value should be a valid emoji']);

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

describe('emoji on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          emoji: withMessage(emoji, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
