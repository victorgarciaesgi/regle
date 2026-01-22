---
title: Announcing Regle 1.1
description: Introducing newest version of Regle with some exiting new features
ogImage: /blog/regle-1.1-features.png
author:
  name: Victor Garcia
date: 2025-04-15
sidebar: false
---

# Announcing Regle `1.1` 🎉

<br/>

![regle 1.1](/blog/regle-1.1-banner.png)

<br/>

I'm happy to announce that a new minor release of Regle is out, bringing exciting new features.

Regle has been on `1.0` for 1 month now and have reached

- **124** stars ⭐️
- **100k npm downloads**

A big thanks to anyone using Regle in the early stages, helping me find and fix edge cases and add more useful features.

<ins>For those who are discovering this library with this blog post</ins>, Regle is a type safe and headless form validation library made for Vue.

It's entirely data-driven, allowing the validation logic to mirror your data structure, enabling a clear separation between the UI and validation logic.

I consider it the successor of **Vuelidate**.

## ▶️ Regle playground

A Regle online playground is now available at https://play.reglejs.dev !  
It provides the same features as the Vue playground while being focused on Regle.

It will make it easier to prototype or to report bugs.

![regle playground](/regle-playground.png)

## 🔃 Variants and discriminated unions support

Your form may not be linear, and have multiple fields that depends on a condition or a toggle.
It can be complex and become a mess when trying to organise your types around it.

Regle variants offer a way to simply declare and use this discriminated unions, while keeping all fields correctly types and also runtime safe.

```vue
<template>
  <div v-if="narrowVariant(r$, 'type', 'EMAIL')">
    <!-- `email` is a known field only in this block -->
    <input v-model="r$.email.$value" placeholder="Email" />
    <Errors :errors="r$.email.$errors" />
  </div>

  <div v-else-if="narrowVariant(r$, 'type', 'GITHUB')">
    <!-- `username` is a known field only in this block -->
    <input v-model="r$.username.$value" placeholder="Email" />
    <Errors :errors="r$.username.$errors" />
  </div>
</template>

<script setup lang="ts">
  import { useRegle, createVariant, narrowVariant } from '@regle/core';

  const state = ref<FormState>({});

  const { r$ } = useRegle(state, () => {
    const variant = createVariant(state, 'type', [
      { type: { literal: literal('EMAIL') }, email: { required, email } },
      { type: { literal: literal('GITHUB') }, username: { required } },
      { type: { required } },
    ]);

    return {
      firstName: { required },
      ...variant.value,
    };
  });
</script>
```

Check out the [documentation for variants](/advanced-usage/variants)

## ✅ `InferSafeOutput` type to infer safe form values

Like Zod's `Infer` utility, Regle now provide its own shortcut for extracting safe output from any `r$` instance.

```ts
import { useRegle, InferSafeOutput } from '@regle/core';

const { r$ } = useRegle(
  { firstName: '', lastName: '' },
  {
    lastName: { required },
  }
);

type FormRequest = InferSafeOutput<typeof r$>;
```

<br/>
<br/>
<br/>

## 🦸 Support Zod 4 <span data-title="zod"></span>

[Zod 4 is currently in beta](https://v4.zod.dev/v4), and Regle officially supports it.

Some bugs on Zod side may persists, but breaking changes are minimal.  
Nothing is to change on Regle side.

## 📞 Allow rules with optional parameters to be used without function call

This is a thing that was bugging me for a while: _rules_ that add an optional parameter still had to be used by a function call.

Ex:

```ts
import { macAddress } from '@regle/rules';

const { r$ } = useRegle(
  { address: '' },
  {
    address: {
      macAddress: macAddress(),
    },
  }
);
```

This also applies to custom rules and it was not convenient.

With this update, when the option of a rule is optional, the rule can be used without calling it.

```ts
import { macAddress } from '@regle/rules';

const { r$ } = useRegle(
  { address: '' },
  {
    address: {
      // Can now be written inline
      macAddress,
      // But can still can be called with arguments
      macAddress: macAddress('::'),
    },
  }
);
```

## 👯‍♀️ Possibility to extend already created useRegle from defineRegleConfig with `extendRegleConfig`

If you have a shared custom `useRegle`, you may want to add even more rules or shortcuts to it. This was not possible with `defineRegleConfig`.

`@regle/core` now exports a new helper called `extendRegleConfig`.

```ts
import { extendRegleConfig } from '@regle/core';

const { useRegle: useExtendedRegle } = extendRegleConfig(useCustomRegle, {
  rules: () => ({
    customRuleExtended: withMessage(required, 'Custom rule 2'),
  }),
});
```

Check out the [docs here](/advanced-usage/global-config#extend-global-config)

## 🔣 allowSymbol option in `alphaNum` and `alpha` rules

Allowing rules with optional parameters to be used without function call was motivated by the fact that I had to add options to `alpha` and `alphaNum`, but would require a breaking changes in declaration.

Both rules have now optionals options, including `allowSymbols`.

```ts
import { alpha, alphaNum } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    alpha: alpha({ allowSymbols: true }),
    alphaNum: alphaNum({ allowSymbols: true }),
})

```

## 👴 Dropped CommonJS support

Regle supported ESM & CJS builds, but after reading [Antfu's article on shipping ESM only](https://antfu.me/posts/move-on-to-esm-only), I decided to remove CJS support.

## Full details

### 🚨 Breaking Changes

- Rename `ipAddress` rule to `ipv4Address` [#91](https://github.com/victorgarciaesgi/regle/issues/91)

### 🚀 Features

- `InferSafeOutput` type to infer safe form values
- Variants and discriminated unions support [#82](https://github.com/victorgarciaesgi/regle/issues/86)
- Allow rules with optional parameters to be used without function execution [#96](https://github.com/victorgarciaesgi/regle/issues/96)
- Zod 4 support
- Dropped CommonJS support
- Possibility to extend already created useRegle from defineRegleConfig with `extendRegleConfig` [#83](https://github.com/victorgarciaesgi/regle/issues/83)
- Symbol option in `alphaNum` and `alpha` rules [#89](https://github.com/victorgarciaesgi/regle/issues/89)

### 🐞 Bug Fixes

- StackBlitz template isn't easily clonable [#93](https://github.com/victorgarciaesgi/regle/issues/93)
- Rule validation message are not uniform [#90](https://github.com/victorgarciaesgi/regle/issues/90)
- `useRegle` typing bug when using rules defined in ref [#94](https://github.com/victorgarciaesgi/regle/issues/94)

[Check the full changelog here](https://github.com/victorgarciaesgi/regle/releases/tag/v1.1.0)
