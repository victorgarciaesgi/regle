import { computed, reactive, ref, type UnwrapRef } from 'vue';
import type {
  Regle,
  RegleComputedRules,
  ReglePartialRuleTree,
  RegleRuleDefinition,
} from '@regle/core';
import { useRegle } from '@regle/core';
import { ruleMockIsEven } from './rules.fixtures';
import { email, required, requiredIf } from '@regle/rules';
// eslint-disable-next-line
export type { RefSymbol } from '@vue/reactivity';

type ReturnRegleType = ReturnType<typeof nestedReactiveObjectValidation>;

export function nestedReactiveObjectValidation() {
  const form = reactive({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | null }],
    },
  });
  return useRegle(form, {
    level0: { rule: ruleMockIsEven },
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
  });
}

export function nestedRefObjectValidation(): ReturnRegleType {
  const form = ref({
    level0: 0,
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

export function simpleNestedStateWithMixedValidation() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  return useRegle(form, {
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
    contacts: [] as { name: '' }[],
  });

  // TODO inferRules function util
  // All type utils
  // Change doc
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
      }) satisfies ReglePartialRuleTree<UnwrapRef<typeof form>>
  );

  return useRegle(form, rules);
}
