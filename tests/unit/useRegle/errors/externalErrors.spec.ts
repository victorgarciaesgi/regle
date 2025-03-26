import { inferRules, useRegle, type RegleExternalErrorTree } from '@regle/core';
import { required } from '@regle/rules';
import { computed, nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeUnRuledCorrectField,
  shouldBeUnRuledPristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

describe('external errors', () => {
  it('should behave correctly when no client rule are present', async () => {
    function nestedExternalErrorsOnly() {
      interface Form {
        root: string;
        nested: { name1: { name2: string } };
        collection: {
          item: string;
        }[];
      }

      const form = ref<Form>({
        root: '',
        nested: { name1: { name2: '' } },
        collection: [{ item: '' }, { item: '' }],
      });

      const externalErrors = ref<RegleExternalErrorTree<Form>>({});

      return {
        externalErrors,
        ...useRegle(form, {}, { externalErrors }),
      };
    }
    const { vm } = createRegleComponent(nestedExternalErrorsOnly);

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.$fields.root);
    shouldBeUnRuledPristineField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeUnRuledPristineField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    shouldBeUnRuledCorrectField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeUnRuledCorrectField(vm.r$.$fields.root);
    shouldBeUnRuledCorrectField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeUnRuledCorrectField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.$fields.root);
    shouldBeUnRuledPristineField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeUnRuledPristineField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$value).toStrictEqual({
      root: '',
      nested: { name1: { name2: '' } },
      collection: [{ item: '' }, { item: '' }],
    });
  });

  function nestedExternalErrorsWithRules() {
    interface Form {
      root: string;
      nested: { name1: { name2: string } };
      collection: {
        item: string;
      }[];
    }

    const form = ref<Form>({
      root: '',
      nested: { name1: { name2: '' } },
      collection: [{ item: '' }, { item: '' }],
    });

    const externalErrors = ref<RegleExternalErrorTree<Form>>({});

    const rules = computed(() => {
      return inferRules(form, {
        root: { required },
        nested: { name1: { name2: { required } } },
        collection: {
          $each: {
            item: { required },
          },
        },
      });
    });

    return {
      externalErrors,
      ...useRegle(form, rules, { externalErrors }),
    };
  }
  it('should behave correctly when client rules are present', async () => {
    const { vm } = createRegleComponent(nestedExternalErrorsWithRules);

    shouldBeInvalidField(vm.r$.$fields.root);
    shouldBeInvalidField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeInvalidField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.item);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([
      'This field is required',
      'Server Error',
    ]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual(['This field is required']);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([
      'This field is required',
      'Server Error',
    ]);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.root);
    shouldBeValidField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$correct).toBe(true);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.item);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);
  });

  it('should behave correctly when autoDirty is set to false', async () => {
    vi.useFakeTimers();

    function nestedExternalErrorsWithRulesAutoDirty() {
      interface Form {
        root: string;
        nested: { name1: { name2: string } };
        collection: {
          item: string;
        }[];
      }

      const form = ref<Form>({
        root: '',
        nested: { name1: { name2: '' } },
        collection: [{ item: '' }, { item: '' }],
      });

      const externalErrors = ref<RegleExternalErrorTree<Form>>({});

      const rules = computed(() => {
        return inferRules(form, {
          root: { required },
          nested: { name1: { name2: { required } } },
          collection: {
            $each: {
              item: { required },
            },
          },
        });
      });

      return {
        externalErrors,
        ...useRegle(form, rules, { externalErrors, autoDirty: false }),
      };
    }

    const { vm } = createRegleComponent(nestedExternalErrorsWithRulesAutoDirty);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await nextTick();

    shouldBePristineField(vm.r$.$fields.root);
    shouldBePristineField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBePristineField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$invalid).toBe(false);
    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1200)]);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.item);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.item);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);

    vi.useRealTimers();
  });

  it('should behave correctly when calling $reset', async () => {
    vi.useFakeTimers();

    const { vm } = createRegleComponent(nestedExternalErrorsWithRules);

    await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1200)]);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.item);

    vm.r$.$reset();

    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.$fields.root);
    shouldBeInvalidField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeInvalidField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.root);
    shouldBeValidField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$correct).toBe(true);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.root);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.item);
    shouldBeErrorField(vm.r$.$fields.collection.$each[1].$fields.item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual(['Server Error']);

    // --

    vm.r$.$reset();

    await vm.$nextTick();

    shouldBePristineField(vm.r$.$fields.root);
    shouldBePristineField(vm.r$.$fields.nested.$fields.name1.$fields.name2);
    shouldBePristineField(vm.r$.$fields.collection.$each[0].$fields.item);

    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$fields.root.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.nested.$fields.name1.$fields.name2.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[0].$fields.item.$errors).toStrictEqual([]);
    expect(vm.r$.$fields.collection.$each[1].$fields.item.$errors).toStrictEqual([]);

    // ---
    vi.useRealTimers();
  });
});
