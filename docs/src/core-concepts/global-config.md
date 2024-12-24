---
title: Global configuration
---

<script setup>
import CustomMessages from '../parts/components/global-config/CustomMessages.vue';
</script>

# Global configuration

If your app includes multiple forms, it can be helpful to define a global configuration that centralizes your custom validators, error messages, and modifiers. This eliminates the need to declare these settings repeatedly for every `useRegle` call, improving both code consistency and developer experience with features like autocompletion and type checking.


## Replace built-in rules messages

Each `@regle/rules` rule provides a default error message. You may may not want to call `withMessage` every time you need to use one with a custom error message.

`defineRegleConfig` allows you to redefine the default messages of built-in rules.

```ts twoslash
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [count] }) => {
      return `Minimum length is ${count}. Current length: ${$value?.length}`;
    })
  })
})

const { r$ } = useCustomRegle({ name: '' }, {
  name: {
    required,
    minLength: minLength(6)
  }
})
```

Result: 

<CustomMessages/>


## Declare new rules

While `useRegle` allows you to use any rule key, adding custom rules to the global configuration provides autocompletion and type checking. This improves maintainability and consistency across your application.

```ts twoslash
const someAsyncCall = async () => await Promise.resolve(true);
// ---cut---
// @noErrors
import { defineRegleConfig, createRule, Maybe } from '@regle/core';
import { withMessage, isFilled } from '@regle/rules';

const asyncEmail = createRule({
  async validator(value: Maybe<string>) {
    if (!isFilled(value)) {
      return true;
    }

    const result = await someAsyncCall();
    return result;
  },
  message: 'Email already exists',
});

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    asyncEmail
  })
})

const { r$ } = useCustomRegle({ name: '' }, {
  name: {
    asy
//     ^|
  }
})
```


## Declare modifiers

You can include global modifiers in your configuration to automatically apply them wherever you use the `useRegle` composable. This avoids repetitive declarations and keeps your code clean.

```ts twoslash
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  modifiers: {
    autoDirty: false,
    lazy: true,
    rewardEarly: true
  }
})
```


## Export scoped `inferRules` helper

`defineRegleConfig` also returns a scoped `inferRules` helper, similar to the one exported from `@regle/core`, but that will autocomplete and check your custom rules.

For information about `inferRules`, check [Typing rules docs](/typescript/typing-rules)

```ts twoslash
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const { useRegle, inferRules } = defineRegleConfig({/* */})
```
