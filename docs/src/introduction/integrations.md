---
title: Integrations
---

# Integrations


## Nuxt <span data-title="nuxt"></span>

Adding the Nuxt module enables auto-imports for selected exports.

Run the following command in your Nuxt application:

:::code-group
<!-- ```bash [nuxt]
npx nuxi module add regle
``` -->
```sh [pnpm]
pnpm add @regle/core @regle/rules @regle/nuxt
```

```sh [npm]
npm install @regle/core @regle/rules @regle/nuxt
```

```sh [yarn]
yarn add @regle/core @regle/rules @regle/nuxt
```

```sh [bun]
bun add @regle/core @regle/rules @regle/nuxt
```
:::

You can then declare the module inside your `nuxt.config.ts`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@regle/nuxt']
})
```

### Auto imports

The following exports will become globally available in your Nuxt application:

- `@regle/core`
  - useRegle 
  - createRule
  - defineRegleConfig
  - inferRules
- `@regle/rules` Note: Built-in rules are not auto-injected to minimize the risk of name conflicts.
  - ruleHelpers
  - withAsync
  - withMessage
  - withParams
  - withTooltip
- `@regle/zod` (if present)
  - useZodRegle



## Zod <span data-title="zod"></span>

Regle offers an adapter for [Zod](https://zod.dev/). You can use any zod object schema to validate your state. It offers the same DX as using `@regle/rules`.

Check [documentation for Zod](/advanced-usage/usage-with-zod)

::: code-group
```sh [pnpm]
pnpm add @regle/zod
```

```sh [npm]
npm install @regle/zod
```

```sh [yarn]
yarn add @regle/zod
```

```sh [bun]
bun add @regle/zod
```
:::
