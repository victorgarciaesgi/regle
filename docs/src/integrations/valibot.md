---
title: Valibot
---

<script setup>
import QuickUsage from '../parts/components/valibot/QuickUsage.vue';
import ComputedSchema from '../parts/components/valibot/ComputedSchema.vue';
</script>

# Valibot <span data-title="valibot"></span>

Regle offers an adapter for [Valibot](https://valibot.dev/). You can use any valibot object schema to validate your state. It offers the same DX as using `@regle/rules`.

## Prerequisites

- `valibot` version `1.x`

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


You can use your Valibot schemas to handle forms with the help of `useRegleSchema`, exported from `@regle/schemas`.

```ts twoslash
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

const { r$ } = useRegleSchema({ name: '' }, v.object({
  name: v.pipe(v.string(), v.minLength(3))
}))
```

<QuickUsage />

## Mode

`useRegleSchema` have 2 modes: `rules` and `schema`.

- `rules` (default)
  - Convert and splits the Valibot schema into Regle-compatible rules, allowing the use of every functionnality of Regle.
  - This means that editing a field will only only run it's own validator and not parse the entire schema.
  - This enables independant `async` handling and parsing.
  - Enable the use of `withDeps`

:::warning
`check` and `transform` and other effects functions on `z.object` are not supported in Regle with `rules` mode.

Regle splits the Valibot schema into nested independents schema, so only the field you modify will run it's own schema, and will not rerun the entire object schema for each input.

This prevent the use of effects in a object schema.
:::

- `schema` (experimental)
  - This mode will parse your whole schema at each input, spreading the errors to your nested fields.
  - Less performant, but allow more compatibility with schemas.
  - Prevent the use of nested `$pending` and `$validate`.
  - Prevent the use of `withDeps`.

```ts twoslash
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

const { r$ } = useRegleSchema({ name: '' }, v.object({
  name: v.pipe(v.string(), v.minLength(3))
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
import { useRegleSchema, inferSchema, withDeps} from '@regle/schemas';
import * as v from 'valibot';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => 
  inferSchema(form, v.object({
    firstName: v.string(),
    /** 
     * Important to keep track of the depency change
     * Without it, the validator wouldn't run if `firstName` changed
    */
    lastName: withDeps(
        v.pipe(
          v.string(),
          v.check((v) => v !== form.value.firstName, "Last name can't be equal to first name")
        ),
        [() => form.value.firstName]
      ),
  }))
)

const { r$ } = useRegleSchema(form, schema);

```

<ComputedSchema />


## Type safe output

Similar to the main `useRegle` composable, `r$.$validate` in useRegleSchema also returns a type-safe output.

```ts twoslash
import { useRegleSchema, inferSchema } from '@regle/schemas';
import * as v from 'valibot';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => {
  return inferSchema(form, v.object({
    firstName: v.optional(v.string()),
    lastName: v.pipe(
        v.string(),
        v.minLength(3),
        v.check((v) => v !== form.value.firstName, "Last name can't be equal to first name")
      )
  }))
})

const { r$ } = useRegleSchema(form, schema);

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    console.log(data);
    //            ^?
  }
}

```

