# Async Validation

Async rules perform server-side or expensive validations and update the `$pending` state.

By default, all async rules are debounced by **200ms**. Override with `$debounce` modifier.

## Inline async rule

Use `async await` syntax:

```ts
import { isFilled } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: {
    asyncRule: async (value) => {
      if (!isFilled(value)) return true;
      return await checkEmailOnServer(value);
    },
  },
});
```

If your rule returns a `Promise` but doesn't use `async/await`, wrap with `withAsync`:

```ts
import { withAsync } from '@regle/rules';

{ email: { check: withAsync((value) => fetchCheck(value)) } }
```

## Async with `createRule`

```ts
import { createRule, type Maybe } from '@regle/core';
import { isFilled } from '@regle/rules';

const asyncEmail = createRule({
  async validator(value: Maybe<string>) {
    if (!isFilled(value)) return true;
    return await checkEmailOnServer(value);
  },
  message: 'Email already exists',
});
```

## `$pending` property

- `r$.email.$pending` -- `true` while async rule is running
- `$error` depends on `$pending` -- a field can't be errored while pending
- Use for loading indicators:

```vue
<template>
  <input
    v-model="r$.$value.email"
    :class="{ pending: r$.email.$pending }"
  />
  <span v-if="r$.email.$pending">Checking...</span>
</template>
```

## Debouncing

Override per-field:

```ts
{ email: { $debounce: 500, asyncRule } }
```

Or use `pipe` with debounce option:

```ts
import { pipe, required, email, withAsync } from '@regle/rules';

{
  email: pipe(
    [required, email, asyncValidator],
    { debounce: 300 }
  ),
}
```
