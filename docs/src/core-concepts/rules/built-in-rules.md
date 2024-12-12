---
title: Built-in rules
---

# Built-in rules

All built-in rules are available though `@regle/rules`.

Don't forget to install it if you haven't

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

Requires non-empty data, only if provided data property, ref, or a function resolve to `true`.

```ts
import {requiredIf} from '@regle/rules';

const form = ref({name: '', condition: false});

const conditionRef = ref(false);

const {r$} = useRegle(form, {
  name: {
    required: requiredIf(() => form.value.condition),
    required: requiredIf(conditionRef),
  },
})
```

## `requiredUnless`

_**Params**_
  - `condition: Ref<unknown> | unknown | () => unknown` - the property to base the `required` validator on.


Requires non-empty data, only if provided data property, ref, or a function resolve to `false`.

```ts
import {requiredUnless} from '@regle/rules';

const form = ref({name: '', condition: false});

const conditionRef = ref(false);

const {r$} = useRegle(form, {
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
import {minLength} from '@regle/rules';

const minValue = ref(6);

const {r$} = useRegle({name: ''}, {
  name: {
    minLength: minLength(6),
    minLength: minLength(minValue),
    minLength: minLength(() => minValue.value)
  },
})
```

## maxLength

_**Params**_
  - `max: Ref<number> | number | () => number`

_**Works with**_
  - `Array | Record | string | number`


Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.

```ts
import {maxLength} from '@regle/rules';

const maxValue = ref(6);

const {r$} = useRegle({name: ''}, {
  name: {
    maxLength: maxLength(6),
    maxLength: maxLength(maxValue),
    maxLength: maxLength(() => maxValue.value)
  },
})
```

## `minValue`

_**Params**_
  - `min: Ref<number> | number | () => number`

_**Works with**_
  - `number`

Requires entry to have a specified minimum numeric value.

```ts
import {minValue} from '@regle/rules';

const minCount = ref(6);

const {r$} = useRegle({count: 0}, {
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


  Requires entry to have a specified maximum numeric value.

```ts
import {maxValue} from '@regle/rules';

const maxCount = ref(6);

const {r$} = useRegle({count: 0}, {
  count: {
    maxValue: maxValue(6),
    maxValue: maxValue(maxCount),
    maxValue: maxValue(() => maxCount.value)
  },
})
```

## `between`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `max: Ref<number> | number | () => number`


Checks if a number is in specified bounds. `min` and `max` are both inclusive.

```js

import {between} from '@regle/rules';

const maxCount = ref(6);

const {r$} = useRegle({count: 0}, {
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

Checks is an string contains the corresponding string parameter.

## `startsWith`

_**Params**_
- `start: Ref<string> | string | () => string`

Checks is an string starts with the corresponding string parameter.

## `endsWith`

_**Params**_
- `end: Ref<string> | string | () => string`

Checks is an string ends with the corresponding string parameter.


## `regex`

_**Params**_
- `...regexps: [...Ref<RegExp> | RegExp | () => RegExp]`

Checks is the string or number match one or multiple `RegExp` patterns.


## `dateBefore`
_**Params**_
 - `before: Ref<string | Date> | string | Date | () => string | Date`


Checks if the input date is before the given Date param.

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


Checks if the input date is after the given Date param.

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


Checks if the input date is in the range of the two given Date params.


## `alpha`

Accepts only alphabet characters.

## `alphaNum`

Accepts only alphanumerics.

## `numeric`

Accepts only numerics. String numbers are also numeric.

## `integer`


Accepts positive and negative integers.

## `decimal`

Accepts positive and negative decimal numbers.

## `email`

Accepts valid email addresses. Keep in mind you still have to carefully verify it on your server, as it is impossible to tell if the address is real without sending verification email.

## `ipAddress`

Accepts valid IPv4 addresses in dotted decimal notation like *127.0.0.1*.

## `macAddress`

_**Params**_
  - `separator?: string | Ref<string> | () => string`

Accepts valid MAC addresses like **00:ff:11:22:33:44:55**. Don't forget to call it as a function `macAddress()`, as it has an optional parameter.
You can specify your own separator instead of `':'`. Provide empty separator `macAddress('')` to validate MAC addresses like **00ff1122334455**.

```ts
import {useRegle} from '@regle/core';
import {ref} from 'vue';
// ---cut---
import {macAddress} from '@regle/rules';

const maxCount = ref(6);

const {r$} = useRegle({address: ''}, {
  address: {
    macAddress: macAddress(),
  },
})
```

## sameAs

_**Params**_
  * `target: unknown`


Checks for equality with a given property. Accepts a ref, a direct reference to a data property, or a raw value to compare to it directly.

```ts
import {useRegle} from '@regle/core';
import {ref} from 'vue';
// ---cut---
import {sameAs} from '@regle/rules';

const form = ref({
  password: '',
  confirmPassword: '',
});

const {r$} = useRegle(form, {
  confirmPassword: {
    sameAs: sameAs(() => form.value.password),
  }
})
```

## url

Accepts only URLs.

