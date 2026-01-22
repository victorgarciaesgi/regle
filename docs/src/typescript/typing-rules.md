---
title: Typing rules
---

# Typing rules schema

## Computed rules

When defining your rules schema in a separate computed property, you may lose autocompletion and detailed type checking for your rules. While useRegle will still perform type checks, the feedback will be less informative.

To avoid this, it is recommended to use the `inferRules` utility. This ensures that the rules schema aligns perfectly with the state, preventing extra or mismatched properties.

### Example: Using inferRules

The inferRules utility requires that your state be declared independently of useRegle.

```ts twoslash
// @noErrors
import { computed, ref } from 'vue';
// ---cut---
import { inferRules, useRegle } from '@regle/core';

const form = ref({ name: '' });

const rules = computed(() =>
  inferRules(form, {
    n,
    //   ^|
  })
);

const { r$ } = useRegle(form, rules);
```

<br/>

### Example: Typing Without inferRules

If you prefer not to use inferRules, you can type your rules explicitly using RegleComputedRules. To ensure type safety while retaining type inference, use the satisfies operator.

```ts twoslash
// @noErrors
import { computed, ref } from 'vue';
// ---cut---
import { useRegle, type RegleComputedRules } from '@regle/core';

const form = ref({ name: '' });

const rules = computed(
  () =>
    ({
      name: {
        required: () => true,
      },
    }) satisfies RegleComputedRules<typeof form>
);

const { r$ } = useRegle(form, rules);
```

:::tip
If you don’t want to write your rules in a separate computed property, you can still define them inline.

```ts
const min = ref(1);
useRegle({ name: '' }, () => ({
  name: { minLength: minLength(min.value) },
}));
```

:::

## Typing external nested properties

`inferRules` can be used for any nested properties and chained inside the same schema.

```ts twoslash
// @noErrors
import { inferRules, useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { computed, ref } from 'vue';

const form = ref({ name: { firstName: '', lastName: '' } });

const nameRules = computed(() =>
  inferRules(form.value.name, {
    firstName: { required },
    lastName: { r },
    //           ^|
  })
);

const rules = computed(() =>
  inferRules(form, {
    name: nameRules.value,
  })
);

const { r$ } = useRegle(form, rules);
```

:::tip
`Zod` and `Valibot` also have their own `inferSchema` exported.
:::

## Typing external nested field

`inferRules` can also accept plain values to autocomplete the available rules.

```ts twoslash
import { inferRules, useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { computed, ref } from 'vue';

const form = ref({ name: { firstName: '', lastName: '' } });

const firstNameRules = computed(() =>
  inferRules(form.value.name.firstName, {
    required,
  })
);

const rules = computed(() =>
  inferRules(form, {
    name: {
      firstName: firstNameRules.value,
    },
  })
);

const { r$ } = useRegle(form, rules);
```
