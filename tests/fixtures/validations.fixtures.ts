import type { RegleComputedRules, ReglePartialRuleTree } from '@regle/core';
import { defineRegleConfig, inferRules, useRegle } from '@regle/core';
import { checked, email, required } from '@regle/rules';
import { computed, reactive, ref, type UnwrapRef } from 'vue';
import { ruleMockIsEven } from './rules.fixtures';
// eslint-disable-next-line
export type { RefSymbol } from '@vue/reactivity';

type ReturnRegleType = ReturnType<typeof nestedReactiveObjectValidation>;

export function nestedReactiveObjectValidation(autoDirty = true, rewardEarly = false) {
  const form = reactive({
    level0: 0,
    level0Boolean: null as boolean | null,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | null }],
    },
  });
  return useRegle(
    form,
    {
      level0: { rule: ruleMockIsEven },
      level0Boolean: { required, checked },
      level1: {
        child: { rule: ruleMockIsEven },
        level2: {
          child: { rule: ruleMockIsEven },
        },
        collection: {
          $each: {
            name: { required, ruleMockIsEven },
          },
        },
      },
    },
    {
      autoDirty,
      rewardEarly,
    }
  );
}

export function nestedRefObjectValidation(): ReturnRegleType {
  const form = ref({
    level0: 0,
    level0Boolean: null as boolean | null,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | null }],
    },
  });
  return useRegle(
    form,
    () =>
      ({
        level0: { rule: ruleMockIsEven },
        level0Boolean: { required, checked },

        level1: {
          child: { rule: ruleMockIsEven },
          level2: {
            child: { rule: ruleMockIsEven },
          },
          collection: {
            $each: {
              name: { required, ruleMockIsEven },
            },
          },
        },
      }) satisfies RegleComputedRules<typeof form>
  );
}

export function nestedRefObjectValidationComputed(): ReturnRegleType {
  const form = ref({
    level0: 0,
    level0Boolean: null as boolean | null,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | null }],
    },
  });

  const rules = computed(
    () =>
      ({
        level0: { rule: ruleMockIsEven },
        level0Boolean: { required, checked },

        level1: {
          child: { rule: ruleMockIsEven },
          level2: {
            child: { rule: ruleMockIsEven },
          },
          collection: {
            $each: {
              name: { required, ruleMockIsEven },
            },
          },
        },
      }) satisfies RegleComputedRules<typeof form>
  );

  return useRegle(form, rules);
}

export function nestedReactiveWithRefsValidation(): ReturnRegleType {
  const form = reactive({
    level0: ref(0),
    level0Boolean: null as boolean | null,
    level1: {
      child: ref(1),
      level2: {
        child: ref(2),
      },
      collection: [{ name: 0 as number | null }],
    },
  });

  return useRegle(
    form,
    () =>
      ({
        level0: { rule: ruleMockIsEven },
        level0Boolean: { required, checked },

        level1: {
          child: { rule: ruleMockIsEven },
          level2: {
            child: { rule: ruleMockIsEven },
          },
          collection: {
            $each: {
              name: { required, ruleMockIsEven },
            },
          },
        },
      }) satisfies RegleComputedRules<typeof form>
  );
}

export function nesteObjectWithRefsValidation(): ReturnRegleType {
  const form = {
    level0: ref(0),
    level0Boolean: null as boolean | null,
    level1: {
      child: ref(1),
      level2: {
        child: ref(2),
      },
      collection: ref([{ name: 0 as number | null }]),
    },
  };

  return useRegle(
    form,
    () =>
      ({
        level0: { rule: ruleMockIsEven },
        level0Boolean: { required, checked },

        level1: {
          child: { rule: ruleMockIsEven },
          level2: {
            child: { rule: ruleMockIsEven },
          },
          collection: {
            $each: {
              name: { required, ruleMockIsEven },
            },
          },
        },
      }) satisfies RegleComputedRules<typeof form>
  );
}

export function computedValidationsObjectWithRefs(): any {
  const conditional = ref(0);
  const number = ref(0);
  const validations = computed(() => {
    return conditional.value > 5 ? {} : { number: { ruleMockIsEven } };
  });
  return { form: { conditional, number }, ...useRegle({ number, conditional }, validations) };
}

export function simpleNestedStateWithMixedValidation(autoDirty = true, rewardEarly = false) {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  const condition = ref(true);

  return {
    condition,
    ...useRegle(
      form,
      () => ({
        ...(condition.value && {
          email: { required: required, email: email },
        }),
        user: {
          firstName: { required },
          lastName: { required },
        },
        contacts: {
          $each: {
            name: { required },
          },
        },
      }),
      { autoDirty, rewardEarly }
    ),
  };
}

export function simpleNestedStateWithMixedValidationAndGlobalConfig(autoDirty = true) {
  const { useRegle: useCustomRegle }: { useRegle: typeof useRegle } = defineRegleConfig({
    modifiers: {
      autoDirty,
    },
  });
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  return useCustomRegle(form, {
    email: { required: required, email: email },
    user: {
      firstName: { required },
      lastName: { required },
    },
    contacts: {
      $each: {
        name: { required },
      },
    },
  });
}

export function simpleNestedStateWithComputedValidation() {
  const form = ref({
    email: '',
    userRequired: false,
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [] as { name: string }[],
    nested: {
      collection: [{ name: '' }],
    },
  });

  const rules = computed(
    () =>
      ({
        email: { required: required, email: email },
        user: {
          ...(form.value.userRequired && {
            firstName: { required },
            lastName: { required },
          }),
        },
        contacts: {
          $each: {
            name: { required },
          },
        },
        nested: {
          collection: {
            $each: {
              name: { required },
            },
          },
        },
      }) satisfies ReglePartialRuleTree<UnwrapRef<typeof form>>
  );

  const rules2 = computed(() =>
    inferRules(form, {
      email: { required: required, email: email },
      user: {
        ...(form.value.userRequired && {
          firstName: { required },
          lastName: { required },
        }),
      },
      contacts: {
        $each: {
          name: { required },
        },
      },
      nested: {
        collection: {
          $each: {
            name: { required },
          },
        },
      },
    })
  );

  return useRegle(form, rules);
}
