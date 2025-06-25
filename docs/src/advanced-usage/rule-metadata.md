---
title: Rules metadata
description: Rule validator functions can return more than just a boolean
---
<script setup>
import UsingMetadataCreateRule from '../parts/components/metadata/UsingMetadataCreateRule.vue';
</script>

# Rules metadata

Rule validator functions can return more than just a boolean. It can return any object as long as it returns an object containing at least `$valid: boolean`.  

This additional data can be utilized by your `message` handler, `active` handler, or any other part of your application that has access to the regle instance.


```ts twoslash
// @noErrors
import {withMessage} from '@regle/rules';
import {useRegle} from '@regle/core';

const inlineRule = withMessage((value: unknown) => {
  return {  
    $valid: true,
    myCustomMetadata: 100
  }
}, ({myCustomMetadata}) => `Hello ${myCustomMetadata}`)
//                                      ^?


const { r$ } = useRegle({name: ''}, {
  name: {inlineRule}
})

r$.name.$rules.inlineRule.$metadata.
//                                  ^|
```

## Using metadata in `createRule`

You can use `createRule` to define your custom rules. Let's explore a real-world example by creating a password strength validator.

:::code-group

```ts twoslash include strongPassword [strongPassword.ts] 
// @module: esnext
// @filename strongPassword.ts
// ---cut---
import { createRule, Maybe } from '@regle/core';
import { isFilled } from '@regle/rules';
import { passwordStrength, type Options } from 'check-password-strength';

export const strongPassword = createRule({
  validator(value: Maybe<string>, options?: Options<string>) {
    if (isFilled(value)) {
      const result = passwordStrength(value, options);
      return {
        $valid: result.id > 1,
        result,
      };
    }

    return { $valid: true };
  },
  message({ result }) {
    return `Your password is ${result?.value}`;
  },
});
```

``` vue twoslash [ComponentA.vue]
<template>
  <div>
    <input
      v-model="r$.$value.password"
      :class="{ valid: r$.password.$correct }"
      placeholder="Type your password"
    />

    <button type="button" @click="r$.$reset({toInitialState: true})">Reset</button>
  </div>

  <div
    class="password-strength"
    :class="[`level-${r$.password.$rules.strongPassword.$metadata.result?.id}`]">
  </div>

  <ul v-if="r$.$errors.password.length">
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>

  <div v-else-if="r$.password.$correct" class="success">
    Your password is strong enough
  </div>
</template>

<script setup lang="ts">
// @include: strongPassword
// @noErrors
// ---cut---
// @module: esnext
import { useRegle } from '@regle/core';

const { r$ } = useRegle(
  { password: '' },
  {
    password: {
      strongPassword: strongPassword(),
    },
  }
);
</script>

```


:::

Result:

<UsingMetadataCreateRule />
