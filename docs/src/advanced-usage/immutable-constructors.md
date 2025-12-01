# Handling immutable constuctors

Regle works by tracking changes in the state and updating the validation rules accordingly.

This works great for objects and arrays, but not for immutable constructors (like `Decimal` from `decimal.js` or `Moment` from `moment.js`, etc...).

This constructors will be interpreted as regular objects and their properties treated as nested fields.

## Default Usage

To handle these cases, you can use the `markStatic` helper to mark the value as static and treat the constructor as a regular raw Field.

```vue
<template>
  <input :value="r$.decimal.$value?.toString()" @input="handleDecimalInput" />
</template>

<script setup lang="ts">
import { markStatic, useRegle } from '@regle/core'
import { Decimal } from 'decimal.js'

const StaticDecimal = markStatic(Decimal)

const state = { decimal: new StaticDecimal(0) }

const { r$ } = useRegle(state, {
  decimal: {
    minDecimal: (value: MaybeInput<Decimal>) => {
      return minValue(10).exec(value?.toNumber() ?? 0)
    },
  },
})

function handleDecimalInput(event: Event) {
  r$.decimal.$value = new StaticDecimal($event.target.value || '0')
}
</script>
```


## Schema Usage

When using Regle with `@regle/schemas`, you will have to also declare the static constructor in the schema.

```ts
import { markStatic, useRegleSchema } from '@regle/core'
import { z } from 'zod'

const StaticDecimal = markStatic(Decimal)

const schema = z.object({
  decimal: z.instanceof(StaticDecimal).refine((value) => value.toNumber() > 10),
})

const { r$ } = useRegleSchema({ decimal: new StaticDecimal(0) }, schema)

```


## `isStatic` helper

You can use the `isStatic` helper to check if a value is a static value.

```ts
import { isStatic } from '@regle/core';

const isStatic = isStatic(r$.$value.decimal); // true
```


## `UnwrapStatic` type helper

You can use the `UnwrapStatic` type to unwrap a static value.

```ts
import { type UnwrapStatic } from '@regle/core';

type value = UnwrapStatic<typeof r$.$value.decimal>; // Decimal
```

## `isRegleStatic` type helper

You can use the `isRegleStatic` type helper to check if a value is a static value.

```ts
import { type isRegleStatic } from '@regle/core';

type isStatic = isRegleStatic<typeof state.decimal>; // true
```