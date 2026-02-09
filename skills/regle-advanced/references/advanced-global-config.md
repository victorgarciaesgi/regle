# Global Configuration

Centralize custom validators, error messages, and modifiers with `defineRegleConfig`.

## Replace built-in rule messages

```ts
import { defineRegleConfig } from '@regle/core';
import { withMessage, minLength, required } from '@regle/rules';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    minLength: withMessage(minLength, ({ $value, $params: [min] }) => {
      return `Minimum length is ${min}. Current: ${$value?.length}`;
    }),
  }),
});
```

### With i18n

```ts
const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => {
    const { t } = useI18n();
    return {
      required: withMessage(required, t('general.required')),
      minLength: withMessage(minLength, ({ $params: [min] }) => t('general.minLength', { min })),
    };
  },
});
```

## Register custom rules

Add rules to the global config for autocompletion:

```ts
import { defineRegleConfig, createRule, type Maybe } from '@regle/core';
import { isFilled } from '@regle/rules';

const asyncEmail = createRule({
  async validator(value: Maybe<string>) {
    if (!isFilled(value)) return true;
    return await checkEmailExists(value);
  },
  message: 'Email already exists',
});

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({ asyncEmail }),
});

// Now autocompletes asyncEmail in rules
useCustomRegle({ email: '' }, { email: { asyncEmail } });
```

## Global modifiers

```ts
const { useRegle: useCustomRegle } = defineRegleConfig({
  modifiers: {
    autoDirty: false,
    silent: true,
    lazy: true,
    rewardEarly: true,
  },
});
```

## Scoped `inferRules`

`defineRegleConfig` also returns an `inferRules` helper that autocompletes custom rules:

```ts
const { useRegle, inferRules } = defineRegleConfig({ /* ... */ });
```

## Extend existing config

Add rules to an already-created custom `useRegle`:

```ts
import { extendRegleConfig } from '@regle/core';

const { useRegle: useExtendedRegle } = extendRegleConfig(useCustomRegle, {
  rules: () => ({
    anotherRule: withMessage(required, 'Another custom rule'),
  }),
});
```

## Override default behaviors

### Custom `$edited` comparison

```ts
import { Decimal } from 'decimal.js';

const { useRegle } = defineRegleConfig({
  overrides: {
    isEdited(currentValue, initialValue, defaultHandlerFn) {
      if (currentValue instanceof Decimal && initialValue instanceof Decimal) {
        return currentValue.toNearest(0.01).toString() !== initialValue.toNearest(0.01).toString();
      }
      return defaultHandlerFn(currentValue, initialValue);
    },
  },
});
```
