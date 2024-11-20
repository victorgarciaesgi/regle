---
title: Zod
---

<script setup>
import QuickUsage from '../parts/components/zod/QuickUsage.vue';
import ComputedSchema from '../parts/components/zod/ComputedSchema.vue';

</script>

# Usage with Zod

## Prerequisites

- `zod` version `3` or higher.


## Installation

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


You will need only one composable from the package: `useZodRegle`.

`useZodRegle` have the same type definitions as `useRegle` for state and options.
The difference is instead of passing rules in the 2nd parameter, you pass your Zod schema.

You will still have the benefits of having a `dirty` tracking a custom errors.

All your schemas will be parsed using `safeParse` and `safeParseAsync` (if there is an async transform or refinement). It will retrieve the errors messages defined in the schema directly.

```ts twoslash
import {useZodRegle} from '@regle/zod';
import {z} from 'zod';

const {errors, regle} = useZodRegle({name: ''}, z.object({
  name: z.string().min(1)
}))

```

<QuickUsage/>


## Computed schema

You can also have a computed schema that can be based on other state values.

```ts twoslash
import {useZodRegle, type toZod} from '@regle/zod';
import {z} from 'zod';
import {ref, computed} from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({firstName: '', lastName: ''})

const schema = computed(() => z.object({
  firstName: z.string(),
  lastName: z.string().refine(v => v !== form.value.firstName, {
    message: "Last name can't be equal to first name"
  }),
}) satisfies toZod<Form>)

const {errors, regle} = useZodRegle(form, schema);

```

<ComputedSchema/>


## Type safe output

Same as the main `useRegle`, `validateState` will also return a safe output.


```ts twoslash
import {useZodRegle, toZod} from '@regle/zod';
import {z} from 'zod';
import {ref, computed} from 'vue';

type Form = {
  firstName?: string;
  lastName?: string
}

const form = ref<Form>({firstName: '', lastName: ''})

const schema = computed(() => z.object({
  firstName: z.string().optional(),
  lastName: z.string().min(1).refine(v => v !== form.value.firstName, {
    message: "Last name can't be equal to first name"
  }),
}) satisfies toZod<Form>)

const {errors, regle, validateState} = useZodRegle(form, schema);

async function submit() {
  const result = await validateState();
  if (result) {
    console.log(result);
    //            ^?
  }
}

```