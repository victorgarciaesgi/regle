---
title: Rule properties
description: Rule properties are computed values or methods available in every nested rule status
---

# Rule properties

Rule properties are computed values or methods available in every nested rule status (including `regle`)


Let's take a look at a simple example to explain the different properties.

``` vue twoslash
<script setup lang='ts'>
// @noErrors
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ email: '', user: { firstName: '', lastName: '' } });

const { r$ } = useRegle(form, {
  email: { required },
  user: {
    firstName: { required },
  }
})

r$.email.$rules.required.
//                       ^|
</script>

<template>
  <input v-model='form.user.firstName' placeholder='Type your firstName'/>

  <ul>
    <li v-for="error of r$.$errors.user.firstName" :key='error'>
      {{ error }}
    </li>
  </ul>
</template>
```
<br/>

## Computed properties for rules


### `$valid` {valid}
- Type: `readonly boolean`
  
Indicates the state of validation for this validator.


### `$pending` {pending}
- Type: `readonly boolean`
  

If the rule is async, indicates if it's currently pending. Always `false` if it's synchronous.


### `$message` {message}
- Type: `readonly string | string[]`

Returns the computed error message or messages for the current rule.


### `$active` {active}
- Type: `readonly boolean`
  
Indicates whether or not the rule is enabled (for rules like `requiredIf`)

### `$metadata` {metadata}
- Type `RegleRuleMetadataDefinition`

Contains the metadata returned by the validator function.


### `$type` {type}
- Type: `readonly string`

The name of the rule type.

### `$validator` {validator}
- Type: `readonly (value, ...metadata) => boolean | {$valid: true, [x:string]: any}`

Returns the original rule validator function.

### `$path` {path}
- Type: `readonly string[]`

Returns the current path of the rule (used internally for tracking)

## Common methods for rules


### `$parse` {parse}
- Type: `() => Promise<boolean>`

Run the rule validator and compute its properties like `$message` and `$active`

### `$reset` {reset}
- Type: `() => void`

Reset the `$valid`, `$metadata` and `$pending` states
