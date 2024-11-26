---
title: Using metadata from rules
---
<script setup>
import UsingMetadataCreateRule from '../parts/components/metadata/UsingMetadataCreateRule.vue';
</script>

# Using metadata from rules

Rules validators function can return more data than just a boolean. This data can be used by your `message` handler or `active` handler, or in any other place having access to `regle`.


## Using metadata into `createRule`

Using `createRule` to create your custom rule.
We'll take a real-world example with a password strength case example.


:::code-group

```ts twoslash include strongPassword [strongPassword.ts] 
// @module: esnext
// @filename strongPassword.ts
// ---cut---
import { createRule, Maybe } from '@regle/core';
import { ruleHelpers } from '@regle/rules';
import { passwordStrength, type Options } from 'check-password-strength';

export const strongPassword = createRule({
  validator(value: Maybe<string>, options?: Options<string>) {
    if (ruleHelpers.isFilled(value)) {
      const result = passwordStrength(value, options);
      return {
        $valid: result.id > 1,
        result,
      };
    }
    return {$valid: true};
  },
  message(value, { result }) {
    return `Your password is ${result?.value}`;
  },
});
```

``` vue twoslash [ComponentA.vue]
<template>
  <div>
    <input
      v-model="r$.$value.password"
      :class="{ valid: r$.$fields.password.$valid }"
      placeholder="Type your password"
    />
    <button type="button" @click="r$.$resetAll">Reset</button>
  </div>
  <div
    class="password-strength"
    :class="[`level-${r$.$fields.password.$rules.strongPassword.$metadata.result?.id}`]"
  ></div>
  <ul v-if="r$.$errors.password.length">
    <li v-for="error of r$.$errors.password" :key="error">
      {{ error }}
    </li>
  </ul>
  <div v-else-if="r$.$fields.password.$valid" class="success"
    >Your password is strong enough</div
  >
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