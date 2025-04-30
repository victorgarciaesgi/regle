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



## `alpha`

_**Params**_
  - `allowSymbols?: MaybeRefOrGetter<boolean>`

Allows only alphabetic characters.

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
import { alpha } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: { 
    alpha,
    // or
    alpha: alpha({ allowSymbols: true }),
  },
})
```

## `alphaNum`

_**Params**_
  - `allowSymbols?: MaybeRefOrGetter<boolean>`

Allows only alphanumeric characters.

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
import { alphaNum } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: { 
    alphaNum,
    // or
    alphaNum: alphaNum({ allowSymbols: true }),
})
```

## `between`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `max: Ref<number> | number | () => number`
  - `options?: {allowEqual?: boolean}`


Checks if a number is in specified bounds. `min` and `max` are both inclusive.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
import { between } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    between: between(1, 6),
    between: between(1, maxCount, {allowEqual: false}),
    between: between(() => maxCount.value, 10)
  },
})
```

## `checked`

Requires a boolean value to be `true`. This is useful for checkbox inputs.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { checked } from '@regle/rules';

const { r$ } = useRegle({ confirm: false }, {
  confirm: { checked },
})
```

## `contains`

_**Params**_
- `contain: Ref<string> | string | () => string`

Checks if the string contains the specified substring.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { contains } from '@regle/rules';

const { r$ } = useRegle({ bestLib: '' }, {
  bestLib: {
    contains: contains('regle')
  },
})
```


## `dateAfter`
_**Params**_
 - `after: Ref<string | Date> | string | Date | () => string | Date`
 - `options?: {allowEqual?: boolean}`


Checks if the date is after the given parameter.

```ts twoslash
import {useRegle} from '@regle/core';
// @noErrors
// ---cut---
import { dateAfter } from '@regle/rules';

const { r$ } = useRegle({ birthday: null as Date | null }, {
  birthday: {
    dateAfter: dateAfter(new Date()),
    // or
    dateAfter: dateAfter(new Date(), { allowEqual: false }),
  },
})
```


## `dateBefore`
_**Params**_
 - `before: Ref<string | Date> | string | Date | () => string | Date`
 - `options?: {allowEqual?: boolean}`


Checks if the date is before the given parameter.

```ts twoslash
import {useRegle} from '@regle/core';
// @noErrors
// ---cut---
import { dateBefore } from '@regle/rules';

const { r$ } = useRegle({ birthday: null as Date | null }, {
  birthday: {
    dateBefore: dateBefore(new Date()),
    // or
    dateBefore: dateBefore(new Date(), { allowEqual: false }),
  },
})
```

## `dateBetweeen`

_**Params**_
 - `before: Ref<string | Date> | string | Date | () => string | Date`
 - `after: Ref<string | Date> | string | Date | () => string | Date`
 - `options?: {allowEqual?: boolean}`


Checks if the date falls between the specified bounds.

```ts twoslash
import {useRegle} from '@regle/core';
// @noErrors
// ---cut---
import { dateBetween } from '@regle/rules';

const { r$ } = useRegle({ birthday: null as Date | null }, {
  birthday: {
    dateBetween: dateBetween(new Date(), new Date(2030, 3, 1)),
    // or
    dateBetween: dateBetween(new Date(), new Date(2030, 3, 1), { allowEqual: false }),
  },
})
```


## `decimal`

Allows positive and negative decimal numbers.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { decimal } from '@regle/rules';

const { r$ } = useRegle({ price: 0 }, {
  price: { decimal },
})
```


## `email`

Validates email addresses. Always verify on the server to ensure the address is real and not already in use.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { email } from '@regle/rules';

const { r$ } = useRegle({ email: '' }, {
  email: { email },
})
```

## `endsWith`

_**Params**_
- `end: Ref<string> | string | () => string`

Checks if the string ends with the specified substring.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { endsWith } from '@regle/rules';

const { r$ } = useRegle({ firstName: '' }, {
  firstName: { endsWith: endsWith('foo') },
})
```


## `exactLength`

_**Params**_
  - `count: Ref<number> | number | () => number`

Requires the input value to have a strict specified length, inclusive. Works with arrays, objects and strings.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// @noErrors
// ---cut---
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


## `exactValue`

_**Params**_
  - `count: Ref<number> | number | () => number`

Requires a field to have a strict numeric value.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
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

## `hexadecimal`

Validates hexadecimal values.

```ts twoslash
import { useRegle } from '@regle/core';
// ---cut---
import { hexadecimal } from '@regle/rules';

const { r$ } = useRegle({ hexadecimal: '' }, {
  hexadecimal: { hexadecimal },
})
```

## `integer`

Allows only integers (positive and negative).

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { integer } from '@regle/rules';

const { r$ } = useRegle({ count: 0 }, {
  count: { integer },
})
```


## `ipv4Address`

Validates IPv4 addresses in dotted decimal notation *127.0.0.1*.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { ipv4Address } from '@regle/rules';

const { r$ } = useRegle({ address: '' }, {
  address: { ipv4Address },
})
```



## `macAddress`

_**Params**_
  - `separator?: string | Ref<string> | () => string`

Validates MAC addresses. Call as a function to specify a custom separator (e.g., ':' or an empty string for 00ff1122334455).

```ts twoslash
// @noErrors
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
import { macAddress } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ address: '' }, {
  address: {
    macAddress,
    // or
    macAddress: macAddress('-')
  },
})
```


## `maxLength`

_**Params**_
  - `max: Ref<number> | number | () => number`
  - `options?: {allowEqual?: boolean}`

_**Works with**_
  - `Array | Record | string | number`


Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
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

## `maxValue`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `options?: {allowEqual?: boolean}`


  Requires a field to have a specified maximum numeric value.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
import { maxValue } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    maxValue: maxValue(6),
    maxValue: maxValue(maxCount, {allowEqual: false}),
    maxValue: maxValue(() => maxCount.value)
  },
})
```

## `minLength`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `options?: {allowEqual?: boolean}`

_**Works with**_
  - `Array | Record | string | number`

Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.

```ts twoslash
import {ref} from 'vue';
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
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

## `minValue`

_**Params**_
  - `min: Ref<number> | number | () => number`
  - `options?: {allowEqual?: boolean}`

_**Works with**_
  - `number`

Requires a field to have a specified minimum numeric value.

```ts twoslash
import {ref} from 'vue'
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
import { minValue } from '@regle/rules';

const minCount = ref(6);

const { r$ } = useRegle({ count: 0 }, {
  count: {
    minValue: minValue(6),
    minValue: minValue(minCount, {allowEqual: false}),
    minValue: minValue(() => minCount.value)
  },
})
```

## `nativeEnum`

Validate against a native Typescript enum value. Similar to Zod's `nativeEnum`

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { nativeEnum } from '@regle/rules';

enum Foo {
  Bar, Baz
}

const { r$ } = useRegle({ type: '' }, {
  type: { nativeEnum: nativeEnum(Foo) },
})
```

## `numeric`

Allows only numeric values (including numeric strings).

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { numeric } from '@regle/rules';

const { r$ } = useRegle({ count: 0 }, {
  count: { numeric },
})
```


## `oneOf`

Allow only one of the values from a fixed Array of possible entries.

_**Params**_
  - `options: MaybeRefOrGetter<Array<string | number>>`

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { oneOf } from '@regle/rules';

const { r$ } = useRegle({ aliment: 'Fish' }, {
  aliment: {
    oneOf: oneOf(['Fish', 'Meat', 'Bone'])
  },
})
```

## `regex`

_**Params**_
- `regexps: MaybeRefOrGetter<RegExp | RegExp[]>`

Checks if the value matches one or more regular expressions.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
// @noErrors
import { regex } from '@regle/rules';

const { r$ } = useRegle({ name: '' }, {
  name: {
    regex: regex(/^foo/),
    regex: regex([/^bar/, /baz$/]),
  },
})
```


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

## `startsWith`

_**Params**_
- `start: Ref<string> | string | () => string`

Checks if the string starts with the specified substring.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { startsWith } from '@regle/rules';

const { r$ } = useRegle({ bestLib: '' }, {
  bestLib: {
    startsWith: startsWith('regle')
  },
})
```


## `url`

Validates URLs.

```ts twoslash
import {useRegle} from '@regle/core';
// ---cut---
import { url } from '@regle/rules';

const { r$ } = useRegle({ bestUrl: '' }, {
  bestUrl: { url },
})
```
