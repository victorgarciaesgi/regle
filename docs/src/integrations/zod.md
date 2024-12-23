---
title: Zod
---

<script setup>
import QuickUsage from '../parts/components/zod/QuickUsage.vue';
import ComputedSchema from '../parts/components/zod/ComputedSchema.vue';
</script>

# Zod <span data-title="zod"></span>

Regle offers an adapter for [Zod](https://zod.dev/). You can use any zod object schema to validate your state. It offers the same DX as using `@regle/rules`.

## Prerequisites

- `zod` version `3.x`

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



## Usage


To use `@regle/zod`, you only need one composable: `useZodRegle`.

The `useZodRegle` composable has the same type definitions as `useRegle` for state and options. However, instead of passing rules as the second parameter, you provide a Zod schema.

You still benefit from features like dirty tracking and custom error handling.

All schemas are parsed using `safeParse` and `safeParseAsync` (if your schema includes asynchronous transformations or refinements). Error messages defined in the schema will automatically be retrieved.

```ts twoslash
import { useZodRegle } from '@regle/zod';
import { z } from 'zod';

const { r$ } = useZodRegle({ name: '' }, z.object({
  name: z.string().min(1)
}))

```

<QuickUsage />


## Computed schema

You can also have a computed schema that can be based on other state values.

:::warning
When doing refinements or transform, Vue can't track what the schema depends on because you're in a function callback. 

Same way as `withParams` from `@regle/rules`, you can use the `withDeps` helper to force dependencies on any schema
:::

```ts twoslash
import { useZodRegle, type toZod, withDeps } from '@regle/zod';
import { z } from 'zod';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() =>
  z.object({
    firstName: z.string(),
    /** 
     * Important to keep track of the depency change
     * Without it, the validator wouldn't run if `firstName` changed
    */
    lastName: withDeps(
      z.string().refine((v) => v !== form.value.firstName, {
        message: "Last name can't be equal to first name",
      }),
      [() => form.value.firstName]
    ),
  }) satisfies toZod<Form>
);

const { r$ } = useZodRegle(form, schema);

```

<ComputedSchema />


## Type safe output

Similar to the main `useRegle` composable, `r$.$validate` in useZodRegle also returns a type-safe output.

```ts twoslash
import { useZodRegle, toZod } from '@regle/zod';
import { z } from 'zod';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => z.object({
  firstName: z.string().optional(),
  lastName: z.string().min(1).refine(v => v !== form.value.firstName, {
    message: "Last name can't be equal to first name"
  }),
}) satisfies toZod<Form>)

const { r$ } = useZodRegle(form, schema);

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    console.log(data);
    //            ^?
  }
}

```

