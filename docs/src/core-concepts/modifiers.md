---
title: Modifiers
---

# Modifiers

Modifiers are behaviours or settings letting you control how the rules will behave.

## Deep modifiers

Deep modifiers can be defined as 3rd argument of the `useRegle` composable. They will apply recursevely for all the fields in your state.

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
const {regle} = useRegle({}, {}, {""})
//                                 ^|
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

const {errors, resetAll, regle} = useRegle(form, {
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

<div class="demo-container">
  <div style="display: flex; gap: 8px; align-items: flex-start">
    <div>
       <input v-model='form.email' placeholder='Type your email'/>
        <ul v-if="errors.email.length">
          <li v-for="error of errors.email">
            {{ error }}
          </li>
        </ul>
    </div>
    <div>
        <input v-model='form.name.pseudo' placeholder='Type your pseudo'/>
        <ul v-if="errors.name.pseudo.length">
          <li v-for="error of errors.name.pseudo">
            {{ error }}
          </li>
        </ul>
    </div>
    <button type="button" @click="regle.$clearExternalErrors">Reset Errors</button>
    <button type="button" @click="submit">Submit</button>
  </div>
 
</div>


<script setup lang='ts'>
import { required } from '@regle/rules';
import {ref, reactive} from 'vue';
import { type RegleExternalErrorTree, useRegle } from '@regle/core';

const form = reactive({
  email: '',
  name: {
    pseudo: '',
  }
})

const externalErrors = ref<RegleExternalErrorTree<typeof form>>({});

const {errors, resetAll, regle} = useRegle(form, {
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
</script>


### `rewardEarly`

Type: `boolean`

Turn on the `reward-early-punish-late` mode of Regle. This mode will not set fields as invalid once they are valid, unless manually triggered by or `$validate` method


### `validationGroups`

Type: `(fields) => Record<string, (RegleFieldStatus |RegleCollectionStatus)[]>`

Validation groups let you merge fields properties under one, to better handle validation status.

You will have access to your declared groups in the `regle.$groups` object

```ts twoslash
// @noErrors
import {ref} from 'vue';
// ---cut---
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';

const {regle, errors} = useRegle({email: '', user: {firstName: ''}}, {
  email: {required},
  user: {
    firstName: {required},
  }
}, {
  validationGroups: (fields) => ({
    group1: [fields.email, fields.user.$fields.firstName]
  })
})

regle.$groups.group1.
//                   ^|
```
<br><br><br><br>

## Per-field modifiers

Per-field modifiers allow to customize more precisely which behaviour you want for each field

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
const {regle} = useRegle({name: ''}, {
  name: {$}
//        ^|    
})
```

<br><br>


`$autoDirty` `$lazy` and `$rewardEarly` work the same as the deep modifiers

### `$debounce`
Type: `number`

This let you declare the number of milliseconds the rule need to wait before executing. Useful for async or heavy computations
