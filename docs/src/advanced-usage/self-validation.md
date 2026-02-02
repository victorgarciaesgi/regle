---
title: Object self validation
description: Validate objects directly using $self to apply rules at the object level
---

<script setup>
import SelfValidationBasic from '../parts/components/self-validation/SelfValidationBasic.vue';
</script>

# Object self validation

By default, Regle validates the nested properties of an object. But sometimes you need to validate the object itself, to perform cross-field validation that depends on multiple properties.

The `$self` property allows you to apply validation rules directly to an object, giving you full control over object-level validation.

## Basic usage

Use `$self` to define rules that validate the object itself rather than its nested properties.

```ts twoslash
import { ref } from 'vue';
import { useRegle, type Maybe } from '@regle/core';
import { required, isFilled, minLength, withMessage } from '@regle/rules';

type User = {
  firstName: string;
  lastName: string;
};

const state = ref<{ user: User }>({
  user: {
    firstName: '',
    lastName: '',
  },
});

const { r$ } = useRegle(state, {
  user: {
    $self: {
      // Custom rule: at least one name must be filled
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

In this example the `atLeastOneName` custom rule validates that at least one of `firstName` or `lastName` is filled.

## Accessing `$self` status

The `$self` status is accessible through `r$.fieldName.$self` and provides all standard field status properties:

```vue
<template>
  <ul>
    <li v-for="error of r$.$errors.user.$self" :key="error">
      {{ error }}
    </li>
  </ul>
</template>
```
Result:

<SelfValidationBasic />


