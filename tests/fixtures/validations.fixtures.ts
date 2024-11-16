import { computed, reactive, ref } from 'vue';
import type {
  Regle,
  RegleComputedRules,
  ReglePartialValidationTree,
  RegleRuleDefinition,
} from '@regle/core';
import { useRegle } from '@regle/core';
import { ruleMockIsEven } from './rules.fixtures';
// eslint-disable-next-line
export type { RefSymbol } from '@vue/reactivity';

type ReturnRegleType = Regle<
  {
    level0: number;
    level1: {
      child: number;
      level2: {
        child: number;
      };
    };
  },
  {
    level0: {
      rule: RegleRuleDefinition<number, [], false, boolean, number>;
    };
    level1: {
      child: {
        rule: RegleRuleDefinition<number, [], false, boolean, number>;
      };
      level2: {
        child: {
          rule: RegleRuleDefinition<number, [], false, boolean, number>;
        };
      };
    };
  }
>;

export function nestedReactiveObjectValidation(): ReturnRegleType {
  const form = reactive({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
    },
  });
  return useRegle(form, () => ({
    level0: { rule: ruleMockIsEven },
    level1: {
      child: { rule: ruleMockIsEven },
      level2: {
        child: { rule: ruleMockIsEven },
      },
    },
  }));
}

export function nestedRefObjectValidation(): ReturnRegleType {
  const form = ref({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
    },
  });
  return useRegle(form, () => ({
    level0: { rule: ruleMockIsEven },
    level1: {
      child: { rule: ruleMockIsEven },
      level2: {
        child: { rule: ruleMockIsEven },
      },
    },
  }));
}

export function nestedRefObjectValidationComputed(): ReturnRegleType {
  const form = ref({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
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
    },
  });

  return useRegle(form, () => ({
    level0: { rule: ruleMockIsEven },
    level1: {
      child: { rule: ruleMockIsEven },
      level2: {
        child: { rule: ruleMockIsEven },
      },
    },
  }));
}

// Fucking ts error
// export function nesteObjectWithRefsValidation() {
//   const form = {
//     level0: ref(0),
//     level1: {
//       child: ref(1),
//       level2: {
//         child: ref(2),
//       },
//     },
//   };

//   return {
//     form,
//     ...useRegle(form, () => ({
//       level0: { rule: ruleMockIsEven },
//       level1: {
//         child: { rule: ruleMockIsEven },
//         level2: {
//           child: { rule: ruleMockIsEven },
//         },
//       },
//     })),
//   };
// }

export function computedValidationsObjectWithRefs(): any {
  const conditional = ref(0);
  const number = ref(0);
  const validations = computed(() => {
    return conditional.value > 5 ? {} : { number: { ruleMockIsEven } };
  });
  return { form: { conditional, number }, ...useRegle({ number, conditional }, validations) };
}
