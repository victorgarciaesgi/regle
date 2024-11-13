---
title: Rules properties
---

# Validation properties

Validation properties are computed values or methods available in every nested rule status (including `regle`)


Let's make a simple exemple to explain the different properties

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import {useRegle} from '@regle/core';
import {required} from '@regle/rules';
import {ref} from 'vue';

const form = ref({email: '', user: {firstName: '', lastName: ''}});

const {regle, errors} = useRegle(form, {
  email: {required},
  user: {
    firstName: {required},
  }
})

regle.$fields.email.$rules.required.
//                                  ^|
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
<br/><br/><br/><br/>

## Computed properties for rules


### `$valid`
- Type: `readonly boolean`
  
Indicates the state of validation for this validator


### `$pending`
- Type: `readonly boolean`
  

If the rule is async, indicates if it's currently pending. Always false if it's synchronous.


### `$anyDirty`
- Type: `readonly boolean`

A flag very similar to `$dirty`, with one exception. The `$anyDirty` flag is considered true if given model was $touched or any of its children are `$anyDirty` which means at least one descendant is `$dirty`.


### `$value`
- Type: `TValue` (The current property value type)
  
A reference to the original validated model. It can be used to bind your form with `v-model` too




### `$error`
- Type: `readonly boolean`

Convenience flag to easily decide if a message should be displayed. Equivalent to `$dirty && !$pending && $invalid`


### `$errors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all child properties and nested forms. Only contains errors from properties where $dirty equals true.

### `$silentErrors`
- Type: `readonly string[]`

Collection of all the error messages, collected for all child properties.


## Common methods for fields


### `$validate`
- Type: `() => Promise<boolean>`

Sets all properties as dirty, triggering all rules. Returns a Promise with a boolean, which resolves once all rules finish.

### `$touch`
- Type: `() => void`

Sets its property and all nested properties $dirty state to true.

### `$reset`
- Type: `() => void`

Resets the $dirty state on all nested properties of a form.

### `$clearExternalResults`
- Type: `() => void`

Clears the $externalResults state back to an empty object.

