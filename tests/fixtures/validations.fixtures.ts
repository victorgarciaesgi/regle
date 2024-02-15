import { computed, reactive, ref } from 'vue';
import { useRegle } from '@regle/core';
import { ruleMockIsEven } from './rules.fixtures';
export type { RefSymbol } from '@vue/reactivity';

export function nestedReactiveObjectValidation() {
  const form = reactive({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
    },
  });

  return {
    form,
    ...useRegle(form, () => ({
      level0: { rule: ruleMockIsEven },
      level1: {
        child: { rule: ruleMockIsEven },
        level2: {
          child: { rule: ruleMockIsEven },
        },
      },
    })),
  };
}

export function nestedRefObjectValidation() {
  const form = ref({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
    },
  });
  return {
    form,
    ...useRegle(form, () => ({
      level0: { rule: ruleMockIsEven },
      level1: {
        child: { rule: ruleMockIsEven },
        level2: {
          child: { rule: ruleMockIsEven },
        },
      },
    })),
  };
}

export function nestedReactiveWithRefsValidation() {
  const form = reactive({
    level0: ref(0),
    level1: {
      child: ref(1),
      level2: {
        child: ref(2),
      },
    },
  });

  return {
    form,
    ...useRegle(form, () => ({
      level0: { rule: ruleMockIsEven },
      level1: {
        child: { rule: ruleMockIsEven },
        level2: {
          child: { rule: ruleMockIsEven },
        },
      },
    })),
  };
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

export function computedValidationsObjectWithRefs() {
  const conditional = ref(0);
  const number = ref(0);
  const validations = computed(() => {
    return conditional.value > 5 ? {} : { number: { ruleMockIsEven } };
  });
  return { form: { conditional, number }, ...useRegle({ number, conditional }, validations) };
}
