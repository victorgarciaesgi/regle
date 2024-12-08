---
title: Modifiers
---

<script setup>
import ExternalErrors from '../parts/components/modifiers/ExternalErrors.vue';
</script>

# Modifiers

Modifiers are behaviours or settings letting you control how the rules will behave.

## Deep modifiers

Deep modifiers can be defined as 3rd argument of the `useRegle` composable. They will apply recursevely for all the fields in your state.

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
const {r$} = useRegle({}, {}, {""})
//                              ^|
```

### `autoDirty`
Type: `boolean`

Default: `true`

Allow all the nested rules to track changes on the state automatically.
If set to `false`, you need to call `$touch` to manually trigger the change

### `lazy`
Type: `boolean`

Default: `false`

Usage:

When set to false, tells the rules to be called on init, otherwise they are lazy and only called when the field is dirty.

### `externalErrors`

Type: `RegleExternalErrorTree<State>` 

Pass an object, matching your error state, that holds external validation errors. These can be from a backend validations or something else.

```ts twoslash
import { required } from '@regle/rules';
import {ref, reactive} from 'vue';
// ---cut---
import { type RegleExternalErrorTree, useRegle } from '@regle/core'

const form = reactive({
  email: '',
  name: {
    pseudo: '',
  }
})

const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const {r$} = useRegle(form, {
  email: {required},
  name: {pseudo: {required}}
}, {
  externalErrors
})

function submit() {
  externalErrors.value = {
    email: ["Email already exists"],
    name: {
      pseudo: ["Pseudo already exists"]
    }
  }
}
```

Result:

<ExternalErrors/>


### `rewardEarly`

Type: `boolean`

Default: `false`

Turn on the `reward-early-punish-late` mode of Regle. This mode will not set fields as invalid once they are valid, unless manually triggered by or `$validate` method.

This will have effects only if you use `autoDirty: false`.

### `clearExternalErrorsOnChange`

Type: `boolean`

Default: `true`

This mode is similar to `rewardEarly`, but only applies to external errors.
Setting it to `false` will keep the server errors until `$clearExternalErrors` is called.

### `validationGroups`

Type: `(fields) => Record<string, (RegleFieldStatus |RegleCollectionStatus)[]>`

Validation groups let you merge fields properties under one, to better handle validation status.

You will have access to your declared groups in the `r$.$groups` object

```ts twoslash
// @noErrors
import {ref} from 'vue';
// ---cut---
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const {r$} = useRegle({email: '', user: {firstName: ''}}, {
  email: {required},
  user: {
    firstName: {required},
  }
}, {
  validationGroups: (fields) => ({
    group1: [fields.email, fields.user.$fields.firstName]
  })
})

r$.$groups.group1.
//                ^|
```
<br><br><br><br>

## Per-field modifiers

Per-field modifiers allow to customize more precisely which behaviour you want for each field

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
const {r$} = useRegle({name: ''}, {
  name: {$}
//        ^|    
})
```

<br><br>


`$autoDirty` `$lazy` and `$rewardEarly` work the same as the deep modifiers

### `$debounce`
Type: `number` (ms)

This let you declare the number of milliseconds the rule need to wait before executing. Useful for async or heavy computations.

:::tip
All async rules have a default debounce of `200ms`, you can disable or modify this setting with `$debounce`
:::
