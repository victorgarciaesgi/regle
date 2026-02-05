---
title: Global configuration
---

<script setup>
import CustomMessages from '../parts/components/global-config/CustomMessages.vue';
</script>

# Global configuration

If your app includes multiple forms, it can be helpful to define a global configuration that centralizes your custom validators, error messages, and modifiers. This eliminates the need to declare these settings repeatedly for every `useRegle` call, improving both code consistency and developer experience with features like autocompletion and type checking.


## Replace built-in rules messages

Each `@regle/rules` rule provides a default error message. You may not want to call `withMessage` every time you need to use one with a custom error message.

`defineRegleConfig` allows you to redefine the default messages of built-in rules.

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [min] }) => {
      return `Minimum length is ${min}. Current length: ${$value?.length}`;
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


:::tip
If you use Nuxt, check out the [Nuxt module](/integrations/nuxt) for a even better DX.  
It provides a way to add your custom global config to your auto-imports.
:::

### i18n

You can also use any i18n library directly inside the config.

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';
import { useI18n } from 'vue-i18n';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => {
    const { t } = useI18n()

    return {
      required: withMessage(required, t('general.required')),
      minLength: withMessage(minLength, ({ $value, $params: [max] }) => {
        return t('general.minLength', {max});
      })
    }
  }
})
```


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

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  modifiers: {
    autoDirty: false,
    silent: true,
    lazy: true,
    rewardEarly: true
  }
})
```


## Export scoped `inferRules` helper

`defineRegleConfig` also returns a scoped `inferRules` helper, similar to the one exported from `@regle/core`, but that will autocomplete and check your custom rules.

For information about `inferRules`, check [Typing rules docs](/typescript/typing-rules)

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const { useRegle, inferRules } = defineRegleConfig({/* */})
```


## Extend global config

It's also possible to add additional config to an already created custom `useRegle`.

With `extendRegleConfig`, you can recreate a custom one with a existing composable as an input.

```ts twoslash
// @noErrors
import { defineRegleConfig, extendRegleConfig, createRule } from '@regle/core';
import { withMessage, required } from '@regle/rules';


const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    customRule: withMessage(required, 'Custom rule'),
  })
})

const {useRegle: useExtendedRegle} = extendRegleConfig(useCustomRegle, {
  rules: () => ({
    customRuleExtended: withMessage(required, 'Custom rule 2'),
  })
})


useExtendedRegle({name: ''}, {
  name: {
    custom
    //    ^|
  }
})

```


## Override default behaviors

You can override the default behaviors of Regle processors by using the `overrides` property.


### `isEdited`

Override the default `$edited` property handler. Useful to handle custom comparisons for complex object types.

:::warning
It's highly recommended to use this override with the [`markStatic`](/advanced-usage/immutable-constructors) helper to handle immutable constructors.
:::

```ts
import { defineRegleConfig } from '@regle/core';
import { Decimal } from 'decimal.js';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  overrides: {
    isEdited(currentValue, initialValue, defaultHandlerFn) {
      if (currentValue instanceof Decimal && initialValue instanceof Decimal) {
        return currentValue.toNearest(0.01).toString() !== initialValue.toNearest(0.01).toString();
      }
      // fallback to the default handler
      return defaultHandlerFn(currentValue, initialValue);
    },
  },
})
```