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
pnpm add @regle/valibot
```

```sh [npm]
npm install @regle/valibot
```

```sh [yarn]
yarn add @regle/valibot
```

```sh [bun]
bun add @regle/valibot
```
:::



## Usage


To use `@regle/valibot`, you only need one composable: `useValibotRegle`.

The `useValibot` composable has the same type definitions as `useRegle` for state and options. However, instead of passing rules as the second parameter, you provide a Valibot schema.

You still benefit from features like dirty tracking and custom error handling.

All schemas are parsed using `safeParse` and `safeParseAsync` (if your schema includes asynchronous transformations or refinements). Error messages defined in the schema will automatically be retrieved.

```ts twoslash
import { useValibotRegle } from '@regle/valibot';
import * as v from 'valibot';

const { r$ } = useValibotRegle({ name: '' }, v.object({
  name: v.pipe(v.string(), v.minLength(3))
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
import { useValibotRegle, type toValibot, withDeps} from '@regle/valibot';
import * as v from 'valibot';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => 
  v.object({
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
  }) satisfies toValibot<Form>
)

const { r$ } = useValibotRegle(form, schema);

```

<ComputedSchema />


## Type safe output

Similar to the main `useRegle` composable, `r$.$validate` in useValibotRegle also returns a type-safe output.

```ts twoslash
import { useValibotRegle, toValibot } from '@regle/valibot';
import * as v from 'valibot';
import { ref, computed } from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({ firstName: '', lastName: '' })

const schema = computed(() => v.object({
  firstName: v.optional(v.string()),
  lastName: v.pipe(
      v.string(),
      v.minLength(3),
      v.check((v) => v !== form.value.firstName, "Last name can't be equal to first name")
    )
}) satisfies toValibot<Form>)

const { r$ } = useValibotRegle(form, schema);

async function submit() {
  const { result, data } = await r$.$validate();
  if (result) {
    console.log(data);
    //            ^?
  }
}

```

