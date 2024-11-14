---
title: Global configuration
---

# Global configuration

If you have multiple forms in your app, you may want to have a global config containing your custom validators, custom error messages and your modifiers without the need to declare it every time with every `useRegle` call.

This will allow you to reduce code accross your app, and help the developer experience as there will be autocompletion and typecheck for everywhere you use it.


## Replace default error messages

Each `regle/rules` rule provide a default error message. You may don't want to call `withMessage` every time you need to use one with a custom error message.

`defineRegleConfig` allows you to redefine rules default error messages

```ts twoslash
import {defineRegleConfig} from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const useCustomRegle = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, (value, { $params: [count] }) => {
      return `Maximum length is ${count}. Current value: ${value?.length}`;
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