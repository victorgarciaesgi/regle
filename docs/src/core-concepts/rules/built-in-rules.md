---
title: Built-in rules
---

# Built-in rules

All built-in rules are available through the `@regle/rules` package.

Don't forget to install it if you haven't:

::: code-group

```sh [pnpm]
pnpm add @regle/rules
```

```sh [npm]
npm install @regle/rules
```

```sh [yarn]
yarn add @regle/rules
```

```sh [bun]
bun add @regle/rules
```

:::

:::tip
Every built-in rule will check if the value of the field is set before checking if it's valid.

This allow to have rules even if the field is not required.
:::

## `required`

Requires non-empty data. Checks for empty arrays and strings containing only whitespaces.

```ts
import {required} from '@regle/rules';

const {r$} = useRegle({name: ''}, {
  name: {required},
})
```

## `requiredIf`

_**Params**_
  - `condition: Ref<unknown> | unknown | () => unknown` - the property to base the `required` validator on.

Requires non-empty data, only if provided data property, ref, or a function resolves to `true`.

```ts
import { requiredIf } from '@regle/rules';

const form = ref({ name: '', condition: false });

const conditionRef = ref(false);

const { r$ } = useRegle(form, {
  name: {
    required: requiredIf(() => form.value.condition),
    required: requiredIf(conditionRef),
  },
})
```

## `requiredUnless`

_**Params**_
  - `condition: Ref<unknown> | unknown | () => unknown` - the property to base the `required` validator on.


Requires non-empty data, only if provided data property, ref, or a function resolves to `false`.

```ts
import { requiredUnless } from '@regle/rules';

const form = ref({ name: '', condition: false });

const conditionRef = ref(false);

const { r$ } = useRegle(form, {
  name: {
    required: requiredUnless(() => form.value.condition),
    required: requiredUnless(conditionRef)
  },
})
```

## `checked`

Requires a boolean value to be `true`. This is useful for checkbox inputs.

## `minLength`

_**Params**_
  - `min: Ref<number> | number | () => number`

_**Works with**_
  - `Array | Record | string | number`

Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.

```ts
import { minLength } from '@regle/rules';

const minValue = ref(6);

const { r$ } = useRegle({ name: '' }, {
  name: {
    minLength: minLength(6),
    minLength: minLength(minValue),
    minLength: minLength(() => minValue.value)
  },
})
```

## `maxLength`

_**Params**_
  - `max: Ref<number> | number | () => number`

_**Works with**_
  - `Array | Record | string | number`


Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.

```ts
import { maxLength } from '@regle/rules';

const maxValue = ref(6);

const { r$ } = useRegle({ name: '' }, {
  name: {
    maxLength: maxLength(6),
    maxLength: maxLength(maxValue),
    maxLength: maxLength(() => maxValue.value)
  },
})
```

## `exactLength`

_**Params**_
  - `count: Ref<number> | number | () => number`

Requires the input value to have a strict specified length, inclusive. Works with arrays, objects and strings.

```ts
import { exactLength } from '@regle/rules';

const exactValue = ref(6);

const { r$ } = useRegle({ name: '' }, {
  name: {
    exactLength: exactLength(6),
    exactLength: exactLength(exactValue),
    exactLength: exactLength(() => exactValue.value)
  },
})
```

## `minValue`

_**Params**_
  - `min: Ref<number> | number | () => number`

_**Works with**_
  - `number`

Requires a field to have a specified minimum numeric value.

```ts
import { minValue } from '@regle/rules';

const minCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    minValue: minValue(6),
    minValue: minValue(minCount),
    minValue: minValue(() => minCount.value)
  },
})
```

## `maxValue`

_**Params**_
  - `min: Ref<number> | number | () => number`


  Requires a field to have a specified maximum numeric value.

```ts
import { maxValue } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    maxValue: maxValue(6),
    maxValue: maxValue(maxCount),
    maxValue: maxValue(() => maxCount.value)
  },
})
```

## `exactValue`

_**Params**_
  - `count: Ref<number> | number | () => number`

Requires a field to have a strict numeric value.

```ts
import { exactValue } from '@regle/rules';

const exactCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    exactValue: exactValue(6),
    exactValue: exactValue(exactCount),
    exactValue: exactValue(() => exactCount.value)
  },
})
```

## `between`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `max: Ref<number> | number | () => number`


Checks if a number is in specified bounds. `min` and `max` are both inclusive.

```ts
import { between } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    between: between(1, 6),
    between: between(1, maxCount),
    between: between(() => maxCount.value, 10)
  },
})
```

## `contains`

_**Params**_
- `contain: Ref<string> | string | () => string`

Checks if the string contains the specified substring.

## `startsWith`

_**Params**_
- `start: Ref<string> | string | () => string`

Checks if the string starts with the specified substring.

## `endsWith`

_**Params**_
- `end: Ref<string> | string | () => string`

Checks if the string ends with the specified substring.


## `regex`

_**Params**_
- `...regexps: [...Ref<RegExp> | RegExp | () => RegExp]`

Checks if the value matches one or more regular expressions.


## `dateBefore`
_**Params**_
 - `before: Ref<string | Date> | string | Date | () => string | Date`


Checks if the date is before the given parameter.

_**Metadata**_
```ts
| true
| {
    $valid: false;
    error: 'date-not-before';
  }
| {
    $valid: false;
    error: 'value-or-paramater-not-a-date';
  }
```

## `dateAfter`
_**Params**_
 - `after: Ref<string | Date> | string | Date | () => string | Date`


Checks if the date is after the given parameter.

_**Metadata**_
```ts
| true
| {
    $valid: false;
    error: 'date-not-after';
  }
| {
    $valid: false;
    error: 'value-or-paramater-not-a-date';
  }
```

## `dateBetweeen`

_**Params**_
 - `before: Ref<string | Date> | string | Date | () => string | Date`
 - `after: Ref<string | Date> | string | Date | () => string | Date`


Checks if the date falls between the specified bounds.


## `alpha`

Allows only alphabetic characters.

## `alphaNum`

Allows only alphanumeric characters.

## `numeric`

Allows only numeric values (including numeric strings).

## `integer`

Allows only integers (positive and negative).

## `decimal`

Allows positive and negative decimal numbers.

## `email`

Validates email addresses. Always verify on the server to ensure the address is real and not already in use.

## `ipAddress`

Validates IPv4 addresses in dotted decimal notation *127.0.0.1*.

## `macAddress`

_**Params**_
  - `separator?: string | Ref<string> | () => string`

Validates MAC addresses. Call as a function to specify a custom separator (e.g., ':' or an empty string for 00ff1122334455).

```ts
import { macAddress } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ address: '' }, {
  address: {
    macAddress: macAddress(),
  },
})
```

## `sameAs`

_**Params**_
  * `target: unknown`


Checks if the value matches the specified property or ref.

```ts
import { sameAs } from '@regle/rules';

const form = ref({
  password: '',
  confirmPassword: '',
});

const { r$ } = useRegle(form, {
  confirmPassword: {
    sameAs: sameAs(() => form.value.password),
  }
})
```

## `url`

Validates URLs.

