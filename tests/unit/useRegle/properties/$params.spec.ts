import { createRule, useRegle, type Maybe } from '@regle/core';
import { ruleHelpers, withAsync, withParams } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { timeout } from '../../../utils';

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
        email: { testParams: withParams((value, min) => (value?.length ?? 0) > min, [min]) },
        user: {
          firstName: {
            testParams: withParams((value, min) => (value?.length ?? 0) > min, [() => min.value]),
          },
        },
        contacts: {
          $each: {
            name: {
              testParams: withParams(
                (value: Maybe<string>, min) => (value?.length ?? 0) > min,
                [min]
              ),
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
      message(value, { $params: [min] }) {
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
      shouldBeInvalidField(vm.r$.$fields.email);
      shouldBeInvalidField(vm.r$.$fields.user);
      shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeInvalidField(vm.r$.$fields.contacts.$each[0].$fields.name);

      await nextTick();

      vm.state.email = 'azertyuio';
      vm.state.user.firstName = 'azertyuio';
      vm.state.contacts[0].name = 'azertyuio';
      await nextTick();

      shouldBeValidField(vm.r$);
      shouldBeValidField(vm.r$.$fields.email);
      shouldBeValidField(vm.r$.$fields.user);
      shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeValidField(vm.r$.$fields.contacts);
      shouldBeValidField(vm.r$.$fields.contacts.$each[0].$fields.name);

      expect(vm.r$.$fields.email.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.$fields.user.$fields.firstName.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.testParams.$params).toStrictEqual([
        6,
      ]);

      vm.state.contacts.push({ name: '' });
      await nextTick();

      vm.min = 10;
      await nextTick();

      shouldBeInvalidField(vm.r$);
      shouldBeErrorField(vm.r$.$fields.email);
      shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
      shouldBeErrorField(vm.r$.$fields.contacts.$each[0].$fields.name);
      shouldBeInvalidField(vm.r$.$fields.contacts.$each[1].$fields.name);

      expect(vm.r$.$fields.email.$rules.testParams.$params).toStrictEqual([10]);
      expect(vm.r$.$fields.user.$fields.firstName.$rules.testParams.$params).toStrictEqual([10]);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.testParams.$params).toStrictEqual([
        10,
      ]);
      expect(vm.r$.$fields.contacts.$each[1].$fields.name.$rules.testParams.$params).toStrictEqual([
        10,
      ]);

      vm.min = 5;

      await nextTick();

      shouldBeInvalidField(vm.r$);
      shouldBeValidField(vm.r$.$fields.email);
      shouldBeValidField(vm.r$.$fields.user);
      shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeInvalidField(vm.r$.$fields.contacts);
      shouldBeValidField(vm.r$.$fields.contacts.$each[0].$fields.name);
      shouldBeInvalidField(vm.r$.$fields.contacts.$each[1].$fields.name);

      expect(vm.r$.$fields.email.$rules.testParams.$params).toStrictEqual([5]);
      expect(vm.r$.$fields.user.$fields.firstName.$rules.testParams.$params).toStrictEqual([5]);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.testParams.$params).toStrictEqual([
        5,
      ]);
      expect(vm.r$.$fields.contacts.$each[1].$fields.name.$rules.testParams.$params).toStrictEqual([
        5,
      ]);

      vm.state.contacts[1].name = 'aeeyeziyr';
      await nextTick();

      shouldBeValidField(vm.r$);
      shouldBeValidField(vm.r$.$fields.email);
      shouldBeValidField(vm.r$.$fields.user);
      shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeValidField(vm.r$.$fields.contacts);
      shouldBeValidField(vm.r$.$fields.contacts.$each[0].$fields.name);
      shouldBeValidField(vm.r$.$fields.contacts.$each[1].$fields.name);
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
      message(value, { $params: [min] }) {
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
      expect(vm.r$.$fields.email.$pending).toBe(false);
      expect(vm.r$.$fields.user.$pending).toBe(false);
      expect(vm.r$.$fields.user.$fields.firstName.$pending).toBe(false);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$pending).toBe(false);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeInvalidField(vm.r$);
      shouldBeInvalidField(vm.r$.$fields.email);
      shouldBeInvalidField(vm.r$.$fields.user);
      shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeInvalidField(vm.r$.$fields.contacts.$each[0].$fields.name);

      vm.state.email = 'azertyuio';
      vm.state.user.firstName = 'azertyuio';
      vm.state.contacts[0].name = 'azertyuio';

      await vi.advanceTimersByTimeAsync(200);
      await nextTick();

      expect(vm.r$.$pending).toBe(true);
      expect(vm.r$.$fields.email.$pending).toBe(true);
      expect(vm.r$.$fields.user.$pending).toBe(true);
      expect(vm.r$.$fields.user.$fields.firstName.$pending).toBe(true);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$pending).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeValidField(vm.r$);
      shouldBeValidField(vm.r$.$fields.email);
      shouldBeValidField(vm.r$.$fields.user);
      shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
      shouldBeValidField(vm.r$.$fields.contacts);
      shouldBeValidField(vm.r$.$fields.contacts.$each[0].$fields.name);

      expect(vm.r$.$fields.email.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.$fields.user.$fields.firstName.$rules.testParams.$params).toStrictEqual([6]);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.testParams.$params).toStrictEqual([
        6,
      ]);

      vm.min = 20;

      await vi.advanceTimersByTimeAsync(200);
      await nextTick();

      expect(vm.r$.$pending).toBe(true);
      expect(vm.r$.$fields.email.$pending).toBe(true);
      expect(vm.r$.$fields.user.$pending).toBe(true);
      expect(vm.r$.$fields.user.$fields.firstName.$pending).toBe(true);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$pending).toBe(true);

      await vi.advanceTimersByTimeAsync(1000);
      await nextTick();

      shouldBeErrorField(vm.r$);
      shouldBeErrorField(vm.r$.$fields.email);
      shouldBeErrorField(vm.r$.$fields.user);
      shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
      shouldBeErrorField(vm.r$.$fields.contacts);
      shouldBeErrorField(vm.r$.$fields.contacts.$each[0].$fields.name);

      expect(vm.r$.$fields.email.$rules.testParams.$params).toStrictEqual([20]);
      expect(vm.r$.$fields.user.$fields.firstName.$rules.testParams.$params).toStrictEqual([20]);
      expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.testParams.$params).toStrictEqual([
        20,
      ]);
    });
  });
});
