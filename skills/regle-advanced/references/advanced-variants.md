# Variants (Discriminated Unions)

Handle forms with conditional fields based on a discriminant value.

## `createVariant`

Define rules that change based on a discriminant field:

```ts
import { useRegle, createVariant } from '@regle/core';
import { literal, required, email } from '@regle/rules';

type FormState =
  | { type: 'EMAIL'; email: string }
  | { type: 'GITHUB'; username: string }
  | { type?: undefined };

const state = ref<FormState>({});

// Use getter syntax for rules
const { r$ } = useRegle(state, () => {
  const variant = createVariant(state, 'type', [
    { type: { literal: literal('EMAIL') }, email: { required, email } },
    { type: { literal: literal('GITHUB') }, username: { required } },
    { type: { required } },
  ]);

  return {
    firstName: { required },
    ...variant.value,
  };
});
```

Each member of the array is an `OR` branch. Regle applies the matching rules based on the discriminant value.

## `narrowVariant`

Type-narrow fields in the template:

```vue
<template>
  <select v-model="r$.type.$value">
    <option value="EMAIL">Email</option>
    <option value="GITHUB">Github</option>
  </select>

  <div v-if="narrowVariant(r$, 'type', 'EMAIL')">
    <!-- `email` is a known field here -->
    <input v-model="r$.email.$value" />
  </div>

  <div v-else-if="narrowVariant(r$, 'type', 'GITHUB')">
    <!-- `username` is a known field here -->
    <input v-model="r$.username.$value" />
  </div>
</template>
```

## Nested variants

For nested discriminated unions, use getter syntax for the first argument:

```ts
type FormState = {
  firstName?: string;
  login:
    | { type: 'EMAIL'; email: string }
    | { type: 'GITHUB'; username: string }
    | { type?: undefined };
};

const state = ref<FormState>({ firstName: '', login: {} });

const { r$ } = useRegle(state, () => {
  const loginVariant = createVariant(() => state.value.login, 'type', [
    { type: { literal: literal('EMAIL') }, email: { required, email } },
    { type: { literal: literal('GITHUB') }, username: { required } },
    { type: { required } },
  ]);

  return {
    firstName: { required },
    login: loginVariant.value,
  };
});
```

In the template: `narrowVariant(r$.login, 'type', 'EMAIL')`.

## `variantToRef`

Get a narrowed ref outside a block scope:

```ts
import { variantToRef } from '@regle/core';

const githubVariant$ = variantToRef(r$, 'type', 'GITHUB');
// Type: Ref<NarrowedStatus | undefined>
```

With `unsafeAssertion` (when you know the variant is always valid):

```ts
const variant$ = variantToRef(r$, 'type', 'EMAIL', { unsafeAssertion: true });
// Type: Ref<NarrowedStatus> (no undefined)
```
