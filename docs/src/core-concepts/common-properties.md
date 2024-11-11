---
title: Common properties
---

# Common properties

Common properties are computed values or methods available in every nested rule status (including `regle`)


Let's make a simple exemple to explain the different properties

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/validators';
import {ref} from 'vue';

const form = ref({email: '', user: {firstName: '', lastName: ''}});

const {regle, errors} = useRegle(form, {
  user: {
    firstName: {required},
  }
})

regle.$fields.user.
//                 ^|
</script>

<template>
  <input v-model='form.user.firstName' placeholder='Type your firstName'/>
  <ul>
    <li v-for="error of errors.user.firstName">
      {{ error }}
    </li>
  </ul>
</template>
```
<br/><br/><br/>

## Computed properties

### `$invalid` 
- Type: `readonly boolean`

Indicates the state of validation for given model becomes true when any of its children validators specified in options returns a falsy value.

### `$valid`
- Type: `readonly boolean`
  
Same as `$invalid`, but for a truthy value

### `$dirty`
- Type: `readonly boolean`
  
A flag indicating whether the field being validated has been interacted with by the user at least once. It's typically used to determine if a message should be displayed to the user. You can control this flag manually using the `$touch` and `$reset` methods. The `$dirty` flag is considered true if the current model has been touched or if all its child models are `$dirty`. 

### `$anyDirty`
- Type: `readonly boolean`

A flag very similar to `$dirty`, with one exception. The `$anyDirty` flag is considered true if given model was $touched or any of its children are `$anyDirty` which means at least one descendant is `$dirty`.

### `$value`
- Type: `TValue` (The current property value type)
  
A reference to the original validated model. It can be used to bind your form with `v-model` too

### `$pending`
- Type: `readonly boolean`

Indicates if any child async validator is currently pending. Always false if all validators are synchronous.

### `$error`
- Type: `readonly boolean`

Convenience flag to easily decide if a message should be displayed. Equivalent to `$dirty && !$pending && $invalid`

  $id?: number;
  $touch(): void;
  $reset(): void;
  $validate(): Promise<boolean>;
  $unwatch(): void;
  $watch(): void;
  $clearExternalErrors(): void;
