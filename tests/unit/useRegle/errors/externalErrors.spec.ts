import { inferRules, useRegle, type RegleBehaviourOptions, type RegleExternalErrorTree } from '@regle/core';
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

    shouldBeUnRuledPristineField(vm.r$.root);
    shouldBeUnRuledPristineField(vm.r$.nested.name1.name2);
    shouldBeUnRuledPristineField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    shouldBeUnRuledCorrectField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeUnRuledCorrectField(vm.r$.root);
    shouldBeUnRuledCorrectField(vm.r$.nested.name1.name2);
    shouldBeUnRuledCorrectField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.root);
    shouldBeUnRuledPristineField(vm.r$.nested.name1.name2);
    shouldBeUnRuledPristineField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$value).toStrictEqual({
      root: '',
      nested: { name1: { name2: '' } },
      collection: [{ item: '' }, { item: '' }],
    });
  });

  function nestedExternalErrorsWithRules(options?: RegleBehaviourOptions) {
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

    const externalErrors = ref<RegleExternalErrorTree<Form> | Record<string, string[]>>({});

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
      ...useRegle(form, rules, { externalErrors, ...options }),
    };
  }
  it('should behave correctly when client rules are present', async () => {
    const { vm } = createRegleComponent(nestedExternalErrorsWithRules);

    shouldBeInvalidField(vm.r$.root);
    shouldBeInvalidField(vm.r$.nested.name1.name2);
    shouldBeInvalidField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual(['This field is required']);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['This field is required', 'Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.root);
    shouldBeValidField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$correct).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);
  });

  it('should behave correctly when silent is set to true', async () => {
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
        ...useRegle(form, rules, { externalErrors, silent: true }),
      };
    }

    const { vm } = createRegleComponent(nestedExternalErrorsWithRulesAutoDirty);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await nextTick();

    shouldBePristineField(vm.r$.root);
    shouldBePristineField(vm.r$.nested.name1.name2);
    shouldBePristineField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$invalid).toBe(false);
    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1200)]);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);

    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);

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

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[0].item);

    vm.r$.$reset();

    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.root);
    shouldBeInvalidField(vm.r$.nested.name1.name2);
    shouldBeInvalidField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.root);
    shouldBeValidField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[1].item);

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

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);

    // --

    vm.r$.$reset();

    await vm.$nextTick();

    shouldBePristineField(vm.r$.root);
    shouldBePristineField(vm.r$.nested.name1.name2);
    shouldBePristineField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    // ---
    vi.useRealTimers();
  });

  it('should behave correctly with clearExternalErrorsOnChange and rewardEarly', async () => {
    const { vm } = createRegleComponent(() =>
      nestedExternalErrorsWithRules({ clearExternalErrorsOnChange: true, rewardEarly: true })
    );

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    await vm.r$.$validate();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual(['This field is required']);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['This field is required', 'Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.root);
    shouldBeValidField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$correct).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);
  });

  it('should behave correctly with clearExternalErrorsOnChange: false', async () => {
    const { vm } = createRegleComponent(() => nestedExternalErrorsWithRules({ clearExternalErrorsOnChange: false }));

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    await vm.r$.$validate();
    vm.externalErrors = {
      root: ['Server Error'],
      nested: { name1: { name2: ['Server Error'] } },
      collection: {
        $self: ['Server Error'],
        $each: [{}, { item: ['Server Error'] }],
      },
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$self);
    shouldBeErrorField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.collection.$self.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual(['This field is required']);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['This field is required', 'Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);
  });

  // --- Dot path errors ---

  it('should behave correctly when using dot path errors and when no client rule are present', async () => {
    function nestedExternalErrorsOnly() {
      interface Form {
        root: string;
        nested: { name1: { name2: string } };
        collection: {
          item: [{ name: string }];
        }[];
      }

      const form = ref<Form>({
        root: '',
        nested: { name1: { name2: '' } },
        collection: [{ item: [{ name: '' }] }, { item: [{ name: '' }] }],
      });

      const externalErrors = ref({});

      return {
        externalErrors,
        ...useRegle(form, {}, { externalErrors }),
      };
    }
    const { vm } = createRegleComponent(nestedExternalErrorsOnly);

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.root);
    shouldBeUnRuledPristineField(vm.r$.nested.name1.name2);
    shouldBeUnRuledPristineField(vm.r$.collection.$each[0].item.$each[0].name);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$each[0].name.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$each[0].name.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      'nested.name1.name2': ['Server Error'],
      'collection.1.item.0.name': ['Server Error'],
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    shouldBeUnRuledCorrectField(vm.r$.collection.$each[0].item.$each[0].name);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$each[0].name.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$each[0].name.$errors).toStrictEqual(['Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[1].item[0].name = 'foo';

    await vm.$nextTick();

    shouldBeUnRuledCorrectField(vm.r$.root);
    shouldBeUnRuledCorrectField(vm.r$.nested.name1.name2);
    shouldBeUnRuledCorrectField(vm.r$.collection.$each[1].item.$each[0].name);

    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$each[0].name.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$each[0].name.$errors).toStrictEqual([]);

    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.root);
    shouldBeUnRuledPristineField(vm.r$.nested.name1.name2);
    shouldBeUnRuledPristineField(vm.r$.collection.$each[0].item.$each[0].name);

    expect(vm.r$.$value).toStrictEqual({
      root: '',
      nested: { name1: { name2: '' } },
      collection: [{ item: [{ name: '' }] }, { item: [{ name: '' }] }],
    });
  });

  it('should work when using dot path external errors and client rules', async () => {
    const { vm } = createRegleComponent(nestedExternalErrorsWithRules);

    shouldBeInvalidField(vm.r$.root);
    shouldBeInvalidField(vm.r$.nested.name1.name2);
    shouldBeInvalidField(vm.r$.collection.$each[0].item);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      root: ['Server Error'],
      'nested.name1.name2': ['Server Error'],
      collection: ['Server Error'],
      'collection.1.item': ['Server Error'],
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeErrorField(vm.r$.collection);
    shouldBeErrorField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['This field is required', 'Server Error']);
    expect(vm.r$.collection.$errors.$self).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual(['This field is required']);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['This field is required', 'Server Error']);

    vm.r$.$value.root = 'foo';
    vm.r$.$value.nested.name1.name2 = 'foo';
    vm.r$.$value.collection[0].item = 'foo';
    vm.r$.$value.collection[1].item = 'foo';

    await vm.$nextTick();

    shouldBeValidField(vm.r$.root);
    shouldBeValidField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(true);
    expect(vm.r$.$correct).toBe(true);

    expect(vm.r$.root.$errors).toStrictEqual([]);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual([]);

    vm.externalErrors = {
      root: ['Server Error'],
      'nested.name1.name2': ['Server Error'],
      'collection.1.item': ['Server Error'],
      collection: ['Server Error 2'],
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.root);
    shouldBeErrorField(vm.r$.nested.name1.name2);
    shouldBeValidField(vm.r$.collection.$each[0].item);
    shouldBeErrorField(vm.r$.collection.$each[1].item);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.root.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.nested.name1.name2.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.collection.$errors.$self).toStrictEqual(['Server Error 2']);
    expect(vm.r$.collection.$each[0].item.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Error']);
  });

  it('should behave correctly when using nested collection dot paths', async () => {
    function nestedExternalErrorsOnly() {
      interface Form {
        base: {
          players: [{ shoes: { id: string; name: string }[] }];
        };
      }

      const form = ref<Form>({
        base: { players: [{ shoes: [{ id: '', name: '' }] }] },
      });

      const externalErrors = ref({});

      return {
        externalErrors,
        ...useRegle(form, {}, { externalErrors }),
      };
    }
    const { vm } = createRegleComponent(nestedExternalErrorsOnly);

    await nextTick();

    shouldBeUnRuledPristineField(vm.r$.base.players.$each[0].shoes.$each[0].name);
    shouldBeUnRuledPristineField(vm.r$.base.players.$each[0].shoes.$each[0].id);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.base.players.$each[0].shoes.$each[0].name.$errors).toStrictEqual([]);
    expect(vm.r$.base.players.$each[0].shoes.$each[0].id.$errors).toStrictEqual([]);

    vm.r$.$touch();
    vm.externalErrors = {
      'base.players.0.shoes': ['Server Error'],
      'base.players.0.shoes.0.id': ['Server Error'],
      'base.players': ['Server Error'],
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.base.players.$each[0].shoes.$self);

    shouldBeUnRuledCorrectField(vm.r$.base.players.$each[0].shoes.$each[0].name);

    expect(vm.r$.$ready).toBe(false);
    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.base.players.$self.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.base.players.$each[0].shoes.$self.$errors).toStrictEqual(['Server Error']);
    expect(vm.r$.base.players.$each[0].shoes.$each[0].name.$errors).toStrictEqual([]);
    expect(vm.r$.base.players.$each[0].shoes.$each[0].id.$errors).toStrictEqual(['Server Error']);
  });
});
