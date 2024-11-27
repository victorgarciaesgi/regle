---
title: Integrations
---

# Integrations


## Nuxt <span data-title="nuxt"></span>

Adding Nuxt module will provide auto-imports for selected exports

Run this command into your nuxt app

:::code-group
```bash [nuxt]
npx nuxi module add regle
```
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

This exports will become globally available in your nuxt app

- `@regle/core`
  - useRegle 
  - createRule
  - defineRegleConfig
  - inferRules
- `@regle/rules` Built-in rules are not injected to reduce risk of name conflict
  - ruleHelpers
  - withAsync
  - withMessage
  - withParams
- `@regle/zod` (if present)
  - useZodRegle



## Zod <span data-title="zod"></span>

Regle offers an adapter for [Zod](https://zod.dev/). You can use any zod object schema to validate your state. In will offers the same DX as using `@regle/rules`.

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

## Valibot

In progress

## Yup

In progress