---
title: Schemas libraries
---

<script setup>
import QuickUsage from '../parts/components/zod/QuickUsage.vue';
import ComputedSchema from '../parts/components/zod/ComputedSchema.vue';
</script>

# Schemas libraries

Regle supports the [Standard Schema Spec](https://standardschema.dev/).

This means any Standard Schema compliant RPC library can be used with Regle.

Official list of supported libraries:

- [Zod](https://zod.dev/) <span data-title="zod"></span> `3.24+`. 
- [Valibot](https://valibot.dev/) <span data-title="valibot"></span> `1+`.
- [ArkType](https://arktype.io/) <span data-title="arktype"></span>  `2+`
- Any library following the [Standard Schema Spec](https://standardschema.dev/) 

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

Instead of using the core `useRegle`, use `useRegleSchema` export from `@regle/schemas`.


:::code-group
```ts twoslash [Zod]
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod';

const { r$ } = useRegleSchema({ name: '' }, z.object({
  name: z.string().min(1)
}))
```

```ts twoslash [Valibot]
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

const { r$ } = useRegleSchema({ name: '' }, v.object({
  name: v.pipe(v.string(), v.minLength(3))
}))
```

```ts twoslash [ArkType]
import { useRegleSchema } from '@regle/schemas';
import { type } from 'arktype';

const { r$ } = useRegleSchema({ name: '' }, type({
  name: "string > 1"
}))
```

:::

<QuickUsage />


:::warning
Limitations from the core behaviour

Using schema libraries uses a different mechanism than the core "rules" one. Regle will parse the entire tree instead of doing it per-field. Than means that properties or methods are not available in nested values:

- `$validate` (only at root)
- `$pending` (only at root)
:::



## Computed schema

You can also have a computed schema that can be based on other state values.

:::warning
When doing refinements or transform, Vue can't track what the schema depends on because you're in a function callback. 

Same way as `withParams` from `@regle/rules`, you can use the `withDeps` helper to force dependencies on any schema
:::

:::code-group

```ts twoslash [Zod]
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
```ts twoslash [Valibot]
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

:::

<ComputedSchema />


## Type safe output

Similar to the main `useRegle` composable, `r$.$validate` also returns a type-safe output using Zod type schema parser.

:::code-group
```ts twoslash [Zod]
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
  const { valid, data } = await r$.$validate();
  if (valid) {
    console.log(data);
    //            ^?
  }
}

```

```ts twoslash [Valibot]
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
  const { valid, data } = await r$.$validate();
  if (valid) {
    console.log(data);
    //            ^?
  }
}

```

```ts twoslash [ArkType]
import { useRegleSchema, inferSchema } from '@regle/schemas';
import { type } from 'arktype';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => {
  return inferSchema(form, type({
    'firstName?': 'string',
    lastName: 'string > 3',
  }).narrow((data, ctx) => {
    if (data.firstName !== data.lastName) {
      return true;
    }
    return ctx.reject({
      expected: 'different than firstName',
      path: ['lastName'],
    });
  }))
})

const { r$ } = useRegleSchema(form, schema);

async function submit() {
  const { valid, data } = await r$.$validate();
  if (valid) {
    console.log(data);
    //            ^?
  }
}
```
:::