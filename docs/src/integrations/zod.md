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

- `zod` version `3.24+`

::: code-group
```sh [pnpm]
pnpm add @regle/schemas
```

```sh [npm]
npm install @regle/schemas
```

```sh [yarn]
yarn add @regle/schemas
```

```sh [bun]
bun add @regle/schemas
```
:::



## Usage

You can use your Zod schemas to handle forms with the help of `useRegleSchema`, exported from `@regle/schemas`.


```ts twoslash
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useRegleSchema({ name: '' }, z.object({
  name: z.string().min(1)
}))
```

<QuickUsage />

## Mode

`useRegleSchema` have 2 modes: `rules` and `schema`.

- `rules` (default)
  - Convert and splits the Zod schema into Regle-compatible rules, allowing the use of every functionnality of Regle.
  - This means that editing a field will only only run it's own validator and not parse the entire schema.
  - This enables independant `async` handling and parsing.
  - Enable the use of `withDeps`

:::warning
`refine` and `transform` and other effects functions on `z.object` are not supported in Regle with `rules` mode.

Regle splits the Zod schema into nested independents schema, so only the field you modify will run it's own schema, and will not rerun the entire object schema for each input.

This prevent the use of effects in a object schema.
:::

- `schema` (experimental)
  - This mode will parse your whole schema at each input, spreading the errors to your nested fields.
  - Less performant, but allow more compatibility with schemas.
  - Prevent the use of nested `$pending` and `$validate`.
  - Prevent the use of `withDeps`.

```ts twoslash
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useRegleSchema({ name: '' }, z.object({
  name: z.string().min(1)
}), {
  mode: 'schema'
})
```

## Computed schema

You can also have a computed schema that can be based on other state values.

:::warning
When doing refinements or transform, Vue can't track what the schema depends on because you're in a function callback. 

Same way as `withParams` from `@regle/rules`, you can use the `withDeps` helper to force dependencies on any schema
:::

```ts twoslash
import { useRegleSchema, inferSchema, withDeps } from '@regle/schemas';
import { z } from 'zod';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() =>
  inferSchema(form, z.object({
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
  }))
);

const { r$ } = useRegleSchema(form, schema);

```

<ComputedSchema />


:::warning
`withDeps` is only compatible with `rules` mode
:::


## Type safe output

Similar to the main `useRegle` composable, `r$.$validate` also returns a type-safe output using Zod type schema parser.

```ts twoslash
import { useRegleSchema, inferSchema } from '@regle/schemas';
import { z } from 'zod';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => inferSchema(form, z.object({
  firstName: z.string().optional(),
  lastName: z.string().min(1).refine(v => v !== form.value.firstName, {
    message: "Last name can't be equal to first name"
  }),
})))

const { r$ } = useRegleSchema(form, schema);

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    console.log(data);
    //            ^?
  }
}

```

