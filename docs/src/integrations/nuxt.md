---
title: Nuxt
---


# Nuxt <span data-title="nuxt"></span>

Adding the Nuxt module enables auto-imports for selected exports.

Run the following command in your Nuxt application:

```bash
npx nuxi module add regle
```

Or do it manually

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
  - withAsync
  - withMessage
  - withParams
  - withTooltip
- `@regle/schemas` (if present)
  - useRegleSchema
  - inferSchema
  - withDeps

