---
title: Global configuration
---

# Global configuration

If you have multiple forms in your app, you may want to have a global config containing your custom validators, custom error messages and your modifiers without the need to declare it every time with every `useRegle` call.

This will allow you to reduce code accross your app, and help the developer experience as there will be autocompletion and typecheck for everywhere you use it.


## Replace build-in rules messages

Each `@regle/rules` rule provide a default error message. You may don't want to call `withMessage` every time you need to use one with a custom error message.

`defineRegleConfig` allows you to redefine rules default error messages

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const useCustomRegle = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, (value, { $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${value?.length}`;
    })
  })
})

const {errors} = useCustomRegle({name: ''}, {
  name: {
    required, minLength: minLength(6)
  }
})
```

Result: 

<div class="demo-container">
  <div>
    <input :class="{valid: regle.$fields.name.$valid}" v-model='state.name' placeholder='Type your name'/>
    <button type="button" @click="resetAll">Reset</button>
  </div>
  <ul v-if="errors.name.length">
    <li v-for="error of errors.name" :key='error'>
      {{ error }}
    </li>
  </ul>
</div>

<script setup lang='ts'>
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const useCustomRegle = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, (value, { $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${value?.length}`;
    })
  })
})

const {errors, state, regle, resetAll} = useCustomRegle({name: ''}, {
  name: {
    required, minLength: minLength(6)
  }
})
</script>


## Declare new rules

in `useRegle`, you can already use any rule key you want. But if you want autocomplete and typecheck for your custom rules, you can also use `defineRegleConfig`.

```ts twoslash
const someAsyncCall = async () => await Promise.resolve(true);
// ---cut---
// @noErrors
import { defineRegleConfig, createRule, defineType } from '@regle/core';
import { withMessage, ruleHelpers } from '@regle/rules';

const asyncEmail = createRule({
  type: defineType<string>('asyncEmail'),
  async validator(value) {
    if (!ruleHelpers.isFilled(value)) {
      return true;
    }
    const result = await someAsyncCall();
    return result;
  },
  message: 'Email already exists',
});

const useCustomRegle = defineRegleConfig({
  rules: () => ({
    asyncEmail
  })
})

const {errors} = useCustomRegle({name: ''}, {
  name: {
    asy
//     ^|
  }
})
```


## Declare modifiers

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const useCustomRegle = defineRegleConfig({
  modifiers: {
    autoDirty: false,
    lazy: true,
    rewardEarly: true
  }
})
```