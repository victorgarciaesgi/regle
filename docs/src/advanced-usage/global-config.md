---
title: Global configuration
---

<script setup>
import CustomMessages from '../parts/components/global-config/CustomMessages.vue';
</script>

# Global configuration

If your app includes multiple forms, it can be helpful to define a global configuration that centralizes your custom validators, error messages, and modifiers. This eliminates the need to declare these settings repeatedly for every `useRegle` call, improving both code consistency and developer experience with features like autocompletion and type checking.

Regle offers two ways to define your global configuration:

- **Composable** — use `defineRegleConfig` to create a custom `useRegle` composable that encapsulates your configuration. Best for scoped or modular setups.
- **Declarative** — use `defineRegleOptions` with the `RegleVuePlugin` to provide configuration at the app level via Vue's plugin system. Best for app-wide defaults that apply everywhere, including the default `useRegle`.

## Composable {#composable}

`defineRegleConfig` creates and returns a custom `useRegle` composable (along with `inferRules` and `useRules`) that has your configuration baked in. This is ideal when you want strong typing and autocompletion for your custom rules.

### Replace built-in rules messages

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

#### i18n

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


### Declare new rules

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


### Declare modifiers

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


### Export scoped `inferRules` helper

`defineRegleConfig` also returns a scoped `inferRules` helper, similar to the one exported from `@regle/core`, but that will autocomplete and check your custom rules.

For information about `inferRules`, check [Typing rules docs](/typescript/typing-rules)

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

export const { useRegle, inferRules } = defineRegleConfig({/* */})
```


### Extend global config

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

## Declarative {#declarative}

The declarative approach uses `defineRegleOptions` combined with the `RegleVuePlugin` to provide global configuration at the Vue app level. The configuration is injected via Vue's `provide/inject` mechanism, so it applies to every `useRegle` call in your application — including the default one from `@regle/core`.

This is especially useful when you want app-wide defaults without needing to import a custom composable everywhere.

### Setup

Pass your options as the second argument to `app.use`:

```ts [main.ts]
import { createApp } from 'vue';
import { RegleVuePlugin, defineRegleOptions } from '@regle/core';
import { withMessage, required, minLength } from '@regle/rules';
import App from './App.vue';

const options = defineRegleOptions({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [min] }) => {
      return `Minimum length is ${min}. Current length: ${$value?.length}`;
    })
  }),
  modifiers: {
    autoDirty: false,
  },
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
});

const app = createApp(App);

// Add the options to the RegleVuePlugin
app.use(RegleVuePlugin, options);

app.mount('#app');
```

Now, every `useRegle` call in your app will automatically use the configured rules and modifiers — no need to import a custom composable.

```vue
<script setup>
import { useRegle } from '@regle/core';
import { required, minLength } from '@regle/rules';
import { ref } from 'vue';

const form = ref({ name: '' });

// This will use the global patched messages and modifiers
const { r$ } = useRegle(form, {
  name: { required, minLength: minLength(6) }
});
</script>
```

### Type augmentation

To get full type-safety and autocompletion with the declarative approach, you can augment Regle's interfaces using TypeScript module augmentation. This lets the default `useRegle` composable know about your custom rules and shortcut properties.

```ts
// regle.d.ts (or in your main.ts)
import { createRule } from '@regle/core';

const customRule = createRule({
  validator: (value: unknown) => value === 'custom',
  message: 'Custom rule',
});

declare module '@regle/core' {
  interface CustomRules {
    customRule: typeof customRule;
  }
  interface CustomFieldProperties {
    $isRequired: boolean;
  }
  interface CustomNestedProperties {
    $isEmpty: boolean;
  }
  interface CustomCollectionProperties {
    $isEmpty: boolean;
  }
}
```

### Combining with composable configuration

If both the plugin options and a `defineRegleConfig` composable are used, the composable's configuration takes precedence and is merged on top of the plugin's. This lets you set app-wide defaults via the plugin while still allowing scoped overrides where needed.


## Override default behaviors

You can override the default behaviors of Regle processors by using the `overrides` property. This works with both the composable and declarative approaches.


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

// Or with the declarative approach
import { defineRegleOptions } from '@regle/core';

const options = defineRegleOptions({
  overrides: {
    isEdited: (currentValue, initialValue, defaultHandlerFn) => {
      return currentValue !== initialValue;
    },
  },
});

app.use(RegleVuePlugin, options);
```