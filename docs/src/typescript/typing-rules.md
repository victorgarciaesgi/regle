---
title: Typing rules
---

# Typing rules schema


## Computed rules

When writing your rules schema in a separated computed property, you will loose the type autocompletes and typecheck (typecheck will still be done by `useRegle` but it will be less informative).

For this the recommended way is to use `inferRules`.

It's recommended because `inferRules` garantees that the rules schema will match the state with no extra properties allowed.

This will require to have your state declared independently than inside `useRegle`

```ts twoslash
// @noErrors
import { inferRules, useRegle } from '@regle/core';
import { computed, ref } from 'vue';

const form = ref({ name: '' });

const rules = computed(() =>
  inferRules(form, {
    n
//   ^|
  })
);

const { r$ } = useRegle(form, rules);
```

:::tip
If you don't want to write your rules in a separate computed, you can still write inline computed one.

```ts
const min = ref(1);
useRegle({name: ''}, () => ({
  name: {minLength: minLength(min.value)}
}))
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