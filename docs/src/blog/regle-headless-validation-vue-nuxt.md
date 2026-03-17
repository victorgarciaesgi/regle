---
title: Regle, the best way to handle form validation in Vue?
description: Why Regle is the spiritualsuccessor to Vuelidate, and how it fits modern Vue and Nuxt forms better than component-first validation patterns.
author:
  name: Victor Garcia
date: 2026-03-16
sidebar: false
outline:
  level: 2
---

# Regle, the best way to handle form validation in Vue?
*March 16, 2026*

<p align="center">
  <img
    class="light-only"
    src="/blog/regle-headless-validation-vue-nuxt/logo-regle-full.svg"
    alt="Regle logo"
    width="520"
  />
  <img
    class="dark-only"
    src="/blog/regle-headless-validation-vue-nuxt/logo-regle-full-reversed.svg"
    alt="Regle logo"
    width="520"
  />
</p>

Most form libraries start feeling heavy once your project stops being a simple login form.

In real Vue and Nuxt apps, validation is rarely just a UI concern: schema checks, conditional flows, shared error messages, and store-driven state all show up quickly. At that point, you need validation to behave like a <u>**headless data layer**</u>, not like a set of components.

That is exactly where Regle fits.

Regle is a type-safe, model-based validation layer for Vue. You keep full freedom over rendering, while Regle manages a typed validation tree that mirrors your state.

## Why this feels familiar if you used Vuelidate

Regle intentionally keeps the model-first mental model many of us liked in Vuelidate: define rules from your data shape, consume a reactive validation object, and keep template code simple.

What changes is mostly quality of life:

- **Type safety**: Stronger typing across the full validation tree
- **Future proof**: Better support for modern patterns (schemas, variants, scoped setups)
- **Scalability**: Easier app-wide consistency with global configuration
- **Developer experience**: Built-in Vue devtools extension for easy debugging and testing.

<br/>

<p align="center">
  <img src="/blog/regle-headless-validation-vue-nuxt/friendship-ended.png" alt="Friendship ended with Vuelidate, now Regle is my best friend" width="420" />
</p>


## A natural walkthrough: from one form to a scalable setup

While showcasing all Regle's feature would be too long for an article, I'll showcase a simple common usage scenario: a login form.

```ts
const state = ref({
  email: '',
  password: '',
});
```

This state is your schema model and your initial values, you can then define your rules based on this state.


```ts
import { useRegle } from '@regle/core';
import { required, email, minLength } from '@regle/rules';

const { r$ } = useRegle(state, {
  email: { required, email },
  password: { required, minLength: minLength(8) },
});
```

From there, template usage stays very direct: bind inputs to `r$.[field].$value`, and read errors from `r$.[field].$errors`.
The important part is that validation lives in your model layer, not in component-specific abstractions.

```vue
<template>
  <div class="email-field">
    <input 
      v-model='r$.email.$value' 
      :class="{ error: r$.email.$error }" 
      placeholder='Type your email'
    />

    <li v-for="error of r$.email.$errors" :key='error'>
      {{ error }}
    </li>
  </div>

  <div class="password-field">
    <input 
      v-model='r$.password.$value' 
      :class="{ error: r$.password.$error }" 
      placeholder='Type your password'
    />

    <li v-for="error of r$.password.$errors" :key='error'>
      {{ error }}
    </li>
  </div>
</template>
```

Regle does a dirty tracking, it means only field that have been modified will display errors.

To triggers a global validation, you can use the `$validate` method.


```ts
async function submit() {
  const { valid, data } = await r$.$validate();
  //               ^ { email?: string, password?: string }
  if (!valid) return;
  console.log(data);
  //            ^ { email: string, password: string }
}
```

Here `data` is is correctly typed, with type-safe values. It's because you declared `required` on both of this fields. If you don't, field is considered as optional and will be marked as maybe undefined in the `data` object.


Regle allows you to reset the validation using [`$reset`](/common-usage/reset-form/), allong with other options to also reset the form state.

```ts
// Reset validation state only, set current value as new initial
r$.$reset();
```

```ts
r$.$reset({ toInitialState: true });
// Reset validation + state to initial value
```


## Scalability

As soon as you have several forms, consistency becomes the next concern.
Without a shared setup, each form starts carrying slightly different error messages or wrappers.
That is where [defineRegleConfig](/advanced-usage/global-config/) helps: one centralized place for defaults, shared messages, and reusable behaviors.

```ts
import { defineRegleConfig } from '@regle/core';
import { required, minLength, withMessage } from '@regle/rules';

export const { useRegle: useAppRegle } = defineRegleConfig({
  rules: () => {
    const { t } = useI18n();

    return {
      required: withMessage(required, t('validation.required')),
      minLength: withMessage(minLength, ({ $params: [min] }) => t('validation.minLength', { min })),
    };
  },
});
```

In Nuxt, the same idea fits naturally with `@regle/nuxt` and a `setupFile`, so your whole app gets the same behavior through auto-imported composables.

Once base rules are shared, most teams need at least one domain-specific rule.
For example: enforce business email domains for back-office accounts.

```ts
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';

export const corporateEmail = createRule({
  validator(value: unknown) {
    if (!isFilled(value)) return true;
    return value.endsWith('@company.com');
  },
  message: "Please use your company email address"
});
```

Define it once, import it where you need it.

```ts
import {corporateEmail} from '@/rules/corporateEmail';

const { r$ } = useRegle(state, {
  email: { required, corporateEmail },
  password: { required, minLength: minLength(8) },
});
```


No manual cleanup dance, no local error maps to reset by hand.



## Conclusion

That is why Regle feels practical in real apps: the flow evolves naturally from a simple form to a scalable validation layer, without forcing you to rewrite your UI architecture.

Regle has a lot of features, here are some of the most useful ones:

- [Schemas libraries integration (Zod, Valibot, ArkType, ...)](https://reglejs.dev/integrations/schemas-libraries/)
- [Array validation](https://reglejs.dev/common-usage/collections)
- [Nuxt integration](https://reglejs.dev/integrations/nuxt/)
- [Scoped validation](https://reglejs.dev/advanced-usage/scoped-validation/)
- [Rules metadata](https://reglejs.dev/advanced-usage/rule-metadata/)
- [Async validation](https://reglejs.dev/common-usage/async-validation/)
