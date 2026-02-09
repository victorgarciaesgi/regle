# Standard Schema

Regle implements the Standard Schema specification, making it usable as a schema library itself.

## Usage as Standard Schema

```ts
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, { name: { required } });

// Use the Standard Schema interface
const result = await r$['~standard'].validate({ name: '' });
console.log(result.issues);
```

### Schema-only usage (no state)

```ts
import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';

const schema = useRules({
  name: { string, required },
});

const result = await schema['~standard'].validate({ name: '' });
```

## `useRules`

Works like `useRegle` but creates an empty state from the rules:

```ts
import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';

const r$ = useRules({
  name: { required, string },
});
```

## `InferInput`

Infer a state type from any rules object:

```ts
import { type InferInput } from '@regle/core';
import { required, string, numeric, type } from '@regle/rules';

const rules = defineRules({
  firstName: { required, string },
  count: { numeric },
  custom: { required, type: type<'FOO' | 'BAR'>() },
});

type State = InferInput<typeof rules>;
// { firstName: string; count: string | number; custom: 'FOO' | 'BAR' }
```

Type-helper rules (`string`, `number`, `boolean`, `date`, `file`, `type<T>()`) help narrow the inferred type.

## `defineRules`

Validate rule structure without a state (catches structural errors):

```ts
import { defineRules } from '@regle/core';

const rules = defineRules({
  firstName: { required, string },
});
```

## `refineRules`

Add dynamic rules that depend on the state (avoids cyclic type errors):

```ts
import { refineRules } from '@regle/core';
import { required, string, sameAs } from '@regle/rules';

const rules = refineRules(
  {
    password: { required, string },
  },
  (state) => ({
    confirmPassword: {
      required,
      sameAs: sameAs(() => state.value.password),
    },
  })
);

type State = InferInput<typeof rules>;
// { password: string; confirmPassword: unknown }
```
