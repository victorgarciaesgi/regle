# Object Self Validation

Use `$self` to validate an object itself (cross-field validation) alongside its nested properties.

## Basic usage

```ts
import { useRegle, type Maybe } from '@regle/core';
import { required, isFilled, minLength, withMessage } from '@regle/rules';

type User = { firstName: string; lastName: string };

const state = ref<{ user: User }>({
  user: { firstName: '', lastName: '' },
});

const { r$ } = useRegle(state, {
  user: {
    $self: {
      atLeastOneName: withMessage(
        (value: Maybe<User>) => isFilled(value?.firstName) || isFilled(value?.lastName),
        'At least one name is required'
      ),
    },
    firstName: { minLength: minLength(3) },
    lastName: { minLength: minLength(3) },
  },
});
```

## Accessing `$self` status

```vue
<template>
  <ul>
    <li v-for="error of r$.$errors.user.$self" :key="error">
      {{ error }}
    </li>
  </ul>
</template>
```

The `$self` status has all standard field status properties (`$invalid`, `$dirty`, `$errors`, etc.).

## Built-in `atLeastOne` rule

For the common pattern of checking at least one key is filled:

```ts
import { atLeastOne } from '@regle/rules';

const { r$ } = useRegle(state, {
  user: {
    $self: {
      atLeastOne,
      // or specific keys
      atLeastOne: atLeastOne(['firstName', 'lastName']),
    },
  },
});
```
