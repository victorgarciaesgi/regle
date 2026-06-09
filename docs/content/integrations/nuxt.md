---
title: Nuxt
description: Enhance the Regle experience with the Nuxt module
---


# Nuxt <span data-title="nuxt"></span>

Adding the Nuxt module enables auto-imports for selected exports.

Run the following command in your Nuxt application:

```bash
npx nuxi module add regle
```

Or do it manually

::tabs
<!-- ```bash [nuxt]
npx nuxi module add regle
:::tabs-item{label="text"}
```text
```sh [pnpm]
:::
pnpm add @regle/core @regle/rules @regle/nuxt
:::tabs-item{label="text"}
```text

```sh [npm]
:::
npm install @regle/core @regle/rules @regle/nuxt
:::tabs-item{label="text"}
```text

```sh [yarn]
:::
yarn add @regle/core @regle/rules @regle/nuxt
:::tabs-item{label="text"}
```text

```sh [bun]
:::
bun add @regle/core @regle/rules @regle/nuxt
:::tabs-item{label="text"}
```text
::
You can then declare the module inside your `nuxt.config.ts`.

```ts [nuxt.config.ts]
:::
export default defineNuxtConfig({
  modules: ['@regle/nuxt']
})
:::tabs-item{label="text"}
```text

## `setupFile`

The Regle Nuxt module allow you to define a global configuration plugin to provide all your forms with the same translations, options and custom rules.



```ts [nuxt.config.ts]
:::
export default defineNuxtConfig({
  modules: ['@regle/nuxt'],
  regle: {
    setupFile: '~/regle-config.ts'
  }
})
:::tabs-item{label="text"}
```text

```ts [app/regle-config.ts]
:::
import { defineRegleNuxtPlugin } from '@regle/nuxt/setup';
import { defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

export default defineRegleNuxtPlugin(() => {
  return defineRegleConfig({
    rules: () => {
      const {t} = useI18n();

      return {
        required: withMessage(required, t('general.required')),
        customRule: myCustomRule,
      }
    },
  });
});

:::tabs-item{label="text"}
```text


This will inject the following composables to your auto-imports and `#imports`, loaded with your custom error messages and rules: 

- `useRegle` 
- `inferRules` 
- `useCollectScope` 
- `useScopedRegle` 
- `type RegleFieldStatus`


```vue [app.vue] {2}
:::
<script setup lang="ts">
import { useRegle } from '#imports';
import { required, minLength, email } from '@regle/rules';

const { r$ } = useRegle({ name: '', email: '' }, {
  name: { required, minLength: minLength(4) },
  email: { email },
});

</script>
:::tabs-item{label="text"}
```text

## No options


If no setup file is provided, the following auto-imports will be added to your app.

- `@regle/core`
  - useRegle 
  - inferRules
  - createRule
  - defineRegleConfig
  - extendRegleConfig
  - createVariant
  - narrowVariant
  - useScopedRegle
  - useCollectScope
  
- `@regle/rules` Note: Built-in rules are not auto-injected to minimize the risk of name conflicts.
  - withAsync
  - withMessage
  - withParams
  - withTooltip
  
- `@regle/schemas` (if present)
  - useRegleSchema
  - inferSchema
  - withDeps
  - defineRegleSchemaConfig


:::
::