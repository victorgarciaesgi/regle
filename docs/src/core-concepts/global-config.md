---
title: Global configuration
---

<script setup>
import CustomMessages from '../parts/components/global-config/CustomMessages.vue';
</script>

# Global configuration

If you have multiple forms in your app, you may want to have a global config containing your custom validators, custom error messages and your modifiers without the need to declare it every time with every `useRegle` call.

This will allow you to reduce code accross your app, and help the developer experience as there will be autocompletion and typecheck for everywhere you use it.


## Replace build-in rules messages

Each `@regle/rules` rule provide a default error message. You may don't want to call `withMessage` every time you need to use one with a custom error message.

`defineRegleConfig` allows you to redefine rules default error messages

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const {useRegle: useCustomRegle} = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, (value, { $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${value?.length}`;
    })
  })
})

const {r$} = useCustomRegle({name: ''}, {
  name: {
    required, minLength: minLength(6)
  }
})
```

Result: 

<CustomMessages/>


## Declare new rules

in `useRegle`, you can already use any rule key you want. But if you want autocomplete and typecheck for your custom rules, you can also use `defineRegleConfig`.

```ts twoslash
const someAsyncCall = async () => await Promise.resolve(true);
// ---cut---
// @noErrors
import { defineRegleConfig, createRule, Maybe } from '@regle/core';
import { withMessage, ruleHelpers } from '@regle/rules';

const asyncEmail = createRule({
  async validator(value: Maybe<string>) {
    if (!ruleHelpers.isFilled(value)) {
      return true;
    }
    const result = await someAsyncCall();
    return result;
  },
  message: 'Email already exists',
});

const {useRegle: useCustomRegle} = defineRegleConfig({
  rules: () => ({
    asyncEmail
  })
})

const {r$} = useCustomRegle({name: ''}, {
  name: {
    asy
//     ^|
  }
})
```


## Declare modifiers

Declaring modifiers in the global configuration will apply it automatically everytime you will use the returned compasable, it avoids declaring it every time.

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const {useRegle: useCustomRegle} = defineRegleConfig({
  modifiers: {
    autoDirty: false,
    lazy: true,
    rewardEarly: true
  }
})
```


## Export scoped `inferRules` helper

`defineRegleConfig` also return a scoped `inferRules` helper, similar to the one exported from `@regle/core`, but that will autocomplete and checks your custom rules.

For informations about `inferRules`, check [Typing rules docs](/typescript/typing-rules)

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const {useRegle, inferRules} = defineRegleConfig({/* */})
```