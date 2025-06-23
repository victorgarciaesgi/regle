import { createRule, useRegle, type Maybe } from '@regle/core';
import { withAsync, withParams } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { timeout } from '../../../utils';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeCorrectNestedStatus,
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

describe('$params', () => {
  function nestedRulesWithGetterParams() {
    const min = ref(6);
    const form = ref({
      email: '',
      user: {
        firstName: '',
        lastName: '',
      },
      contacts: [{ name: '' }],
    });

    return {
      min,
      ...useRegle(form, {
        email: { testParams: withParams((value: Maybe<string>, min) => (value?.length ?? 0) > min, [min]) },
        user: {
          firstName: {
            testParams: withParams((value: Maybe<string>, min) => (value?.length ?? 0) > min, [() => min.value]),
          },
        },
        contacts: {
          $each: {
            name: {
              testParams: withParams((value: Maybe<string>, min) => (value?.length ?? 0) > min, [min]),
            },
          },
        },
      }),
    };
  }

  function nestedRulesWithCreatedRules() {
    const min = ref(6);
    const form = ref({
      email: '',
      user: {
        firstName: '',
        lastName: '',
      },
      contacts: [{ name: '' }],
    });

    const myMinLength = createRule({
      validator(value: Maybe<string>, min: number) {
        return (value?.length ?? 0) >= min;
      },
      message({ $params: [min] }) {
        return `Error: ${min}`;
      },
    });

    return {
      min,
      ...useRegle(form, {
        email: { testParams: myMinLength(min) },
        user: {
          firstName: {
            testParams: myMinLength(min),
          },
        },
        contacts: {
          $each: {
            name: {
              testParams: myMinLength(min),
            },
          },
        },
      }),
    };
  }
  describe.each([
    ['withParams', nestedRulesWithGetterParams],
    ['createRule', nestedRulesWithCreatedRules],
  ])('collects the `$params` passed to a validator via `%s`', async (title, rules) => {
    it('should behave as expected with params', async () => {
      const { vm } = createRegleComponent(rules);

      shouldBeInvalidField(vm.r$);
      shouldBeInvalidField(vm.r$.email);
      shouldBeInvalidField(vm.r$.user);
      shouldBeInvalidField(vm.r$.user.firstName);
      shouldBeInvalidField(vm.r$.contacts.$each[0].name);

      await nextTick();

      vm.r$.$value.email = 'azertyuio';
      vm.r$.$value.user.firstName = 'azertyuio';
      vm.r$.$value.user.lastName = 'zad';
      vm.r$.$value.contacts[0].name = 'azertyuio';
      await nextTick();

      shouldBeCorrectNestedStatus(vm.r$);
      shouldBeValidField(vm.r$.email);
      shouldBeCorrectNestedStatus(vm.r$.user);
      shouldBeValidField(vm.r$.user.firstName);
      shouldBeValidField(vm.r$.contacts);
      shouldBeValidField(vm.r$.contacts.$each[0].name);

      expect(vm.r$.email.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.user.firstName.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.contacts.$each[0].name.$rules.testParams.$params).toStrictEqual([6]);

      vm.r$.$value.contacts.push({ name: '' });
      await nextTick();

      vm.min = 10;
      await nextTick();

      shouldBeErrorField(vm.r$);
      shouldBeErrorField(vm.r$.email);
      shouldBeErrorField(vm.r$.user.firstName);
      shouldBeErrorField(vm.r$.contacts.$each[0].name);
      shouldBeInvalidField(vm.r$.contacts.$each[1].name);

      expect(vm.r$.email.$rules.testParams.$params).toStrictEqual([10]);
      expect(vm.r$.user.firstName.$rules.testParams.$params).toStrictEqual([10]);
      expect(vm.r$.contacts.$each[0].name.$rules.testParams.$params).toStrictEqual([10]);
      expect(vm.r$.contacts.$each[1].name.$rules.testParams.$params).toStrictEqual([10]);

      vm.min = 5;

      await nextTick();

      shouldBeInvalidField(vm.r$);
      shouldBeValidField(vm.r$.email);
      shouldBeCorrectNestedStatus(vm.r$.user);
      shouldBeValidField(vm.r$.user.firstName);
      shouldBeInvalidField(vm.r$.contacts);
      shouldBeValidField(vm.r$.contacts.$each[0].name);
      shouldBeInvalidField(vm.r$.contacts.$each[1].name);

      expect(vm.r$.email.$rules.testParams.$params).toStrictEqual([5]);
      expect(vm.r$.user.firstName.$rules.testParams.$params).toStrictEqual([5]);
      expect(vm.r$.contacts.$each[0].name.$rules.testParams.$params).toStrictEqual([5]);
      expect(vm.r$.contacts.$each[1].name.$rules.testParams.$params).toStrictEqual([5]);

      vm.r$.$value.contacts[1].name = 'aeeyeziyr';
      await nextTick();

      shouldBeCorrectNestedStatus(vm.r$);
      shouldBeValidField(vm.r$.email);
      shouldBeCorrectNestedStatus(vm.r$.user);
      shouldBeValidField(vm.r$.user.firstName);
      shouldBeValidField(vm.r$.contacts);
      shouldBeValidField(vm.r$.contacts.$each[0].name);
      shouldBeValidField(vm.r$.contacts.$each[1].name);
    });
  });

  function nestedAsyncRulesWithGetterParams() {
    const min = ref(6);
    const form = ref({
      email: '',
      user: {
        firstName: '',
        lastName: '',
      },
      contacts: [{ name: '' }],
    });

    async function asyncMin(value: Maybe<string>, min: number) {
      await timeout(1000);
      return (value?.length ?? 0) > min;
    }

    return {
      min,
      ...useRegle(form, {
        email: { testParams: withAsync(asyncMin, [min]) },
        user: {
          firstName: {
            testParams: withAsync(asyncMin, [() => min.value]),
          },
        },
        contacts: {
          $each: {
            name: {
              testParams: withAsync(asyncMin, [min]),
            },
          },
        },
      }),
    };
  }

  function nestedAsyncRulesWithCreatedRules() {
    const min = ref(6);
    const form = ref({
      email: '',
      user: {
        firstName: '',
        lastName: '',
      },
      contacts: [{ name: '' }],
    });

    const myAsyncMinLength = createRule({
      async validator(value: Maybe<string>, min: number) {
        await timeout(1000);
        return (value?.length ?? 0) >= min;
      },
      message({ $params: [min] }) {
        return `Error: ${min}`;
      },
    });

    return {
      min,
      ...useRegle(form, {
        email: { testParams: myAsyncMinLength(min) },
        user: {
          firstName: {
            testParams: myAsyncMinLength(min),
          },
        },
        contacts: {
          $each: {
            name: {
              testParams: myAsyncMinLength(min),
            },
          },
        },
      }),
    };
  }

  describe.each([
    ['withParams', nestedAsyncRulesWithGetterParams],
    ['createRule', nestedAsyncRulesWithCreatedRules],
  ])('collects async validators params with `%s`', async (title, rules) => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should behave as expected with params and async', async () => {
      const { vm } = createRegleComponent(rules);

      await vi.advanceTimersByTimeAsync(200);
      await nextTick();

      // Expect pending to be false as field have to be dirty
      // Validators are run anyway
      expect(vm.r$.$pending).toBe(false);
      expect(vm.r$.email.$pending).toBe(false);
      expect(vm.r$.user.$pending).toBe(false);
      expect(vm.r$.user.firstName.$pending).toBe(false);
      expect(vm.r$.contacts.$each[0].name.$pending).toBe(false);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeInvalidField(vm.r$);
      shouldBeInvalidField(vm.r$.email);
      shouldBeInvalidField(vm.r$.user);
      shouldBeInvalidField(vm.r$.user.firstName);
      shouldBeInvalidField(vm.r$.contacts.$each[0].name);

      vm.r$.$value.email = 'azertyuio';
      vm.r$.$value.user.firstName = 'azertyuio';
      vm.r$.$value.user.lastName = 'azertyuio';
      vm.r$.$value.contacts[0].name = 'azertyuio';

      await vi.advanceTimersByTimeAsync(200);
      await nextTick();

      expect(vm.r$.$pending).toBe(true);
      expect(vm.r$.email.$pending).toBe(true);
      expect(vm.r$.user.$pending).toBe(true);
      expect(vm.r$.user.firstName.$pending).toBe(true);
      expect(vm.r$.contacts.$each[0].name.$pending).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeCorrectNestedStatus(vm.r$);
      shouldBeValidField(vm.r$.email);
      shouldBeCorrectNestedStatus(vm.r$.user);
      shouldBeValidField(vm.r$.user.firstName);
      shouldBeValidField(vm.r$.contacts);
      shouldBeValidField(vm.r$.contacts.$each[0].name);

      expect(vm.r$.email.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.user.firstName.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.contacts.$each[0].name.$rules.testParams.$params).toStrictEqual([6]);

      vm.min = 20;

      await vi.advanceTimersByTimeAsync(200);
      await nextTick();

      expect(vm.r$.$pending).toBe(true);
      expect(vm.r$.email.$pending).toBe(true);
      expect(vm.r$.user.$pending).toBe(true);
      expect(vm.r$.user.firstName.$pending).toBe(true);
      expect(vm.r$.contacts.$each[0].name.$pending).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeErrorField(vm.r$);
      shouldBeErrorField(vm.r$.email);
      shouldBeErrorField(vm.r$.user);
      shouldBeErrorField(vm.r$.user.firstName);
      shouldBeErrorField(vm.r$.contacts);
      shouldBeErrorField(vm.r$.contacts.$each[0].name);

      expect(vm.r$.email.$rules.testParams.$params).toStrictEqual([20]);
      expect(vm.r$.user.firstName.$rules.testParams.$params).toStrictEqual([20]);
      expect(vm.r$.contacts.$each[0].name.$rules.testParams.$params).toStrictEqual([20]);
    });
  });
});
