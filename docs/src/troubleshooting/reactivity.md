---
title: Reactivity caveats
---

# Reactivity caveats

## Tracking Dependencies

When using `useRegle` with a getter function or a computed property, Regle automatically tracks dependencies. However, sometimes dependencies cannot be tracked automatically. In such cases, you can either use the `withParams` wrapper to manually define dependencies or use the `createRule` function which automatically tracks dependencies for you.

To illustrate the issue, consider the following example:

```ts
import { ref, computed } from 'vue';
import { withMessage } from '@regle/rules';
import { type Maybe, type RegleComputedRules } from '@regle/core';

const condition = ref(false);

const weight = (greeting: string) => {
  return withMessage((value: Maybe<number>) => {
    return !!value && value > 1 && condition.value === true;
  }, `Weight must be greater than 1, ${greeting}`);
};

const rules = computed(() => {
  return {
    items: {
      $each: (item) => ({
        weight: {
          weight: weight('Hello World'),
        },
      }),
    },
  } satisfies RegleComputedRules<typeof form>;
});
```

In the above example, the `weight` rule depends on the `condition` ref, which is not tracked by Regle because it is inside a function and Vue cannot collect the reference. To fix this, you can either use the `withParams` wrapper or use the `createRule` function which automatically tracks dependencies for you.

```ts
import { ref } from 'vue';
import { withParams, withMessage } from '@regle/rules';
import { createRule, type Maybe } from '@regle/core';

const condition = ref(false);

// Usage with `withParams`
const weight1 = (greeting: string) => {
  return withMessage(
    withParams(
      (value: Maybe<number>) => {
        return !!value && value > 1 && condition.value === true;
      },
      [condition]
    ),
    `Weight must be greater than 1, ${greeting}`
  );
};

// Usage with `createRule`
const weight2 = createRule({
  validator(value: Maybe<number>, greeting: string, condition: boolean) {
    return !!value && value > 1 && condition === true;
  },

  message: ({ $params: [greeting] }) => {
    return `Weight must be greater than 1, ${greeting}`;
  },
});
```

Now the `condition` ref is tracked by Regle and the rule will be re-evaluated whenever the `condition` ref changes.

## Pinia hydration issues

If you use `store.$dispose()` or Nuxt in SSR mode, you may encounter this error:

```
Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'xxx'
```

This is because Pinia tries to hydrate the stateful property `r$`.
To avoid this, you can use [skipHydrate](https://pinia.vuejs.org/api/pinia/functions/skipHydrate.html#skipHydrate-)

```ts [pinia.store.ts]
import { skipHydrate } from 'pinia';

export const usePiniaStore = defineStore('pinia-store', () => {
  const { r$ } = useRegle(/** */);

  return { r$: skipHydrate(r$) };
});
```
