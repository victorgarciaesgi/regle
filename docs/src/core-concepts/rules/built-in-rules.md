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

```ts
import { alpha } from '@regle/rules';

const { r$ } = useRegle(
  { name: '' },
  {
    name: {
      alpha,
      // or
      alpha: alpha({ allowSymbols: true }),
    },
  }
);
```

## `alphaNum`

_**Params**_

- `allowSymbols?: MaybeRefOrGetter<boolean>`

Allows only alphanumeric characters.

```ts
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

```ts
import { between } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle(
  { count: 0 },
  {
    count: {
      between: between(1, 6),
      between: between(1, maxCount, { allowEqual: false }),
      between: between(() => maxCount.value, 10),
    },
  }
);
```

## `boolean`

Requires a value to be a native boolean type. Mainly used for typing.

```ts
import { type InferInput } from '@regle/core';
import { boolean } from '@regle/rules';

const rules = {
  checkbox: { boolean },
};

const state = ref<InferInput<typeof rules>>({});
```

## `checked`

Requires a boolean value to be `true`. This is useful for checkbox inputs.

```ts
import { checked } from '@regle/rules';

const { r$ } = useRegle(
  { confirm: false },
  {
    confirm: { checked },
  }
);
```

## `contains`

_**Params**_

- `contain: Ref<string> | string | () => string`

Checks if the string contains the specified substring.

```ts
import { contains } from '@regle/rules';

const { r$ } = useRegle(
  { bestLib: '' },
  {
    bestLib: {
      contains: contains('regle'),
    },
  }
);
```

## `date`

Requires a value to be a native Date constructor. Mainly used for typing.

```ts
import { type InferInput } from '@regle/core';
import { date } from '@regle/rules';

const rules = {
  birthday: { date },
};

const state = ref<InferInput<typeof rules>>({});
```

## `dateAfter`

_**Params**_

- `after: Ref<string | Date> | string | Date | () => string | Date`
- `options?: {allowEqual?: boolean}`

Checks if the date is after the given parameter.

```ts
import { dateAfter } from '@regle/rules';

const { r$ } = useRegle(
  { birthday: null as Date | null },
  {
    birthday: {
      dateAfter: dateAfter(new Date()),
      // or
      dateAfter: dateAfter(new Date(), { allowEqual: false }),
    },
  }
);
```

## `dateBefore`

_**Params**_

- `before: Ref<string | Date> | string | Date | () => string | Date`
- `options?: {allowEqual?: boolean}`

Checks if the date is before the given parameter.

```ts
import { dateBefore } from '@regle/rules';

const { r$ } = useRegle(
  { birthday: null as Date | null },
  {
    birthday: {
      dateBefore: dateBefore(new Date()),
      // or
      dateBefore: dateBefore(new Date(), { allowEqual: false }),
    },
  }
);
```

## `dateBetweeen`

_**Params**_

- `before: Ref<string | Date> | string | Date | () => string | Date`
- `after: Ref<string | Date> | string | Date | () => string | Date`
- `options?: {allowEqual?: boolean}`

Checks if the date falls between the specified bounds.

```ts
import { dateBetween } from '@regle/rules';

const { r$ } = useRegle(
  { birthday: null as Date | null },
  {
    birthday: {
      dateBetween: dateBetween(new Date(), new Date(2030, 3, 1)),
      // or
      dateBetween: dateBetween(new Date(), new Date(2030, 3, 1), { allowEqual: false }),
    },
  }
);
```

## `decimal`

Allows positive and negative decimal numbers.

```ts
import { decimal } from '@regle/rules';

const { r$ } = useRegle(
  { price: 0 },
  {
    price: { decimal },
  }
);
```

## `email`

Validates email addresses. Always verify on the server to ensure the address is real and not already in use.

```ts
import { email } from '@regle/rules';

const { r$ } = useRegle(
  { email: '' },
  {
    email: { email },
  }
);
```

## `emoji`

Validates emojis.

```ts
import { emoji } from '@regle/rules';

const { r$ } = useRegle(
  { emoji: '' },
  {
    emoji: { emoji },
  }
);
```

## `endsWith`

_**Params**_

- `end: Ref<string> | string | () => string`

Checks if the string ends with the specified substring.

```ts
import { endsWith } from '@regle/rules';

const { r$ } = useRegle(
  { firstName: '' },
  {
    firstName: { endsWith: endsWith('foo') },
  }
);
```

## `exactDigits`

_**Params**_

- `count: Ref<number> | number | () => number`

Requires the input value to have a strict specified number of digits.

```ts
import { exactDigits } from '@regle/rules';

const exactValue = ref(6);

const { r$ } = useRegle(
  { digits: '' },
  {
    digits: {
      exactDigits: exactDigits(6),
      // or with ref
      exactDigits: exactDigits(exactValue),
      // or with getter
      exactDigits: exactDigits(() => exactValue.value),
    },
  }
);
```

## `exactLength`

_**Params**_

- `count: Ref<number> | number | () => number`

Requires the input value to have a strict specified length, inclusive. Works with arrays, objects and strings.

```ts
import { exactLength } from '@regle/rules';

const exactValue = ref(6);

const { r$ } = useRegle(
  { name: '' },
  {
    name: {
      exactLength: exactLength(6),
      exactLength: exactLength(exactValue),
      exactLength: exactLength(() => exactValue.value),
    },
  }
);
```

## `exactValue`

_**Params**_

- `count: Ref<number> | number | () => number`

Requires a field to have a strict numeric value.

```ts
import { exactValue } from '@regle/rules';

const exactCount = ref(6);

const { r$ } = useRegle(
  { count: 0 },
  {
    count: {
      exactValue: exactValue(6),
      exactValue: exactValue(exactCount),
      exactValue: exactValue(() => exactCount.value),
    },
  }
);
```

## `file`

Requires a value to be a native File constructor. Mainly used for typing.

```ts
import { file } from '@regle/rules';

const rules = {
  file: { file },
};

const state = ref<InferInput<typeof rules>>({});
```

## `fileType`

Requires a value to be a file with a specific type.

```ts
import { fileType } from '@regle/rules';

const { r$ } = useRegle(
  { file: null as File | null },
  {
    file: { fileType: fileType(['image/png', 'image/jpeg']) },
  }
);
```

## `hexadecimal`

Validates hexadecimal values.

```ts
import { hexadecimal } from '@regle/rules';

const { r$ } = useRegle(
  { hexadecimal: '' },
  {
    hexadecimal: { hexadecimal },
  }
);
```

## `hostname`

Validates hostnames.

```ts
import { hostname } from '@regle/rules';

const { r$ } = useRegle(
  { siteHost: '' },
  {
    siteHost: { hostname },
  }
);
```

## `httpUrl`

_**Params**_

- `options?: {protocol?: RegExp}`

Validates HTTP URLs.

```ts
import { httpUrl } from '@regle/rules';

const { r$ } = useRegle(
  { bestUrl: '' },
  {
    bestUrl: { httpUrl },
    // or with custom protocol validation
    bestUrl: { httpUrl: httpUrl({ protocol: /^https$/ }) },
  }
);
```

## `integer`

Allows only integers (positive and negative).

```ts
import { integer } from '@regle/rules';

const { r$ } = useRegle(
  { count: 0 },
  {
    count: { integer },
  }
);
```

## `ipv4Address`

Validates IPv4 addresses in dotted decimal notation _127.0.0.1_.

```ts
import { ipv4Address } from '@regle/rules';

const { r$ } = useRegle(
  { address: '' },
  {
    address: { ipv4Address },
  }
);
```

## `literal`

Validates literal values.

```ts
import { literal } from '@regle/rules';

const { r$ } = useRegle(
  { value: '' },
  {
    value: { literal: literal('foo') },
  }
);
```

## `lowercase`

Validates lowercase strings.

```ts
import { lowercase } from '@regle/rules';

const { r$ } = useRegle(
  { name: '' },
  {
    name: { lowercase },
  }
);
```

## `macAddress`

_**Params**_

- `separator?: string | Ref<string> | () => string`

Validates MAC addresses. Call as a function to specify a custom separator (e.g., ':' or an empty string for 00ff1122334455).

```ts
// @noErrors
import { macAddress } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle(
  { address: '' },
  {
    address: {
      macAddress,
      // or
      macAddress: macAddress('-'),
    },
  }
);
```

## `maxFileSize`

Requires a value to be a file with a maximum size.

```ts
import { maxFileSize } from '@regle/rules';

const { r$ } = useRegle(
  { file: null as File | null },
  {
    file: { maxFileSize: maxFileSize(10_000_000) }, // 10 MB
  }
);
```

## `maxLength`

_**Params**_

- `max: Ref<number> | number | () => number`
- `options?: {allowEqual?: boolean}`

_**Works with**_

- `Array | Record | string | number`

Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.

```ts
import { maxLength } from '@regle/rules';

const maxValue = ref(6);

const { r$ } = useRegle(
  { name: '' },
  {
    name: {
      maxLength: maxLength(6),
      maxLength: maxLength(maxValue),
      maxLength: maxLength(() => maxValue.value),
    },
  }
);
```

## `maxValue`

_**Params**_

- `min: Ref<number> | number | () => number`
- `options?: {allowEqual?: boolean}`

Requires a field to have a specified maximum numeric value.

```ts
import { maxValue } from '@regle/rules';

const maxCount = ref(6);

const { r$ } = useRegle(
  { count: 0 },
  {
    count: {
      maxValue: maxValue(6),
      maxValue: maxValue(maxCount, { allowEqual: false }),
      maxValue: maxValue(() => maxCount.value),
    },
  }
);
```

## `minFileSize`

Requires a value to be a file with a minimum size.

```ts
import { minFileSize } from '@regle/rules';

const { r$ } = useRegle(
  { file: null as File | null },
  {
    file: { minFileSize: minFileSize(1_000_000) }, // 1 MB
  }
);
```

## `minLength`

_**Params**_

- `min: Ref<number> | number | () => number`
- `options?: {allowEqual?: boolean}`

_**Works with**_

- `Array | Record | string | number`

Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.

```ts
import { minLength } from '@regle/rules';

const minValue = ref(6);

const { r$ } = useRegle(
  { name: '' },
  {
    name: {
      minLength: minLength(6),
      minLength: minLength(minValue),
      minLength: minLength(() => minValue.value),
    },
  }
);
```

## `minValue`

_**Params**_

- `min: Ref<number> | number | () => number`
- `options?: {allowEqual?: boolean}`

_**Works with**_

- `number`

Requires a field to have a specified minimum numeric value.

```ts
import { minValue } from '@regle/rules';

const minCount = ref(6);

const { r$ } = useRegle(
  { count: 0 },
  {
    count: {
      minValue: minValue(6),
      minValue: minValue(minCount, { allowEqual: false }),
      minValue: minValue(() => minCount.value),
    },
  }
);
```

## `nativeEnum`

Validate against a native Typescript enum value. Similar to Zod's `nativeEnum`

```ts
import { nativeEnum } from '@regle/rules';

enum Foo {
  Bar,
  Baz,
}

const { r$ } = useRegle(
  { type: '' },
  {
    type: { nativeEnum: nativeEnum(Foo) },
  }
);
```

## `number`

Requires a value to be a native number type. Mainly used for typing.

```ts
import { number } from '@regle/rules';

const rules = {
  count: { number },
};

const state = ref<InferInput<typeof rules>>({});
```

## `numeric`

Allows only numeric values (including numeric strings).

```ts
import { numeric } from '@regle/rules';

const { r$ } = useRegle(
  { count: 0 },
  {
    count: { numeric },
  }
);
```

## `oneOf`

Allow only one of the values from a fixed Array of possible entries.

_**Params**_

- `options: MaybeRefOrGetter<Array<string | number>>`

```ts
import { oneOf } from '@regle/rules';

const { r$ } = useRegle(
  { aliment: 'Fish' },
  {
    aliment: {
      oneOf: oneOf(['Fish', 'Meat', 'Bone']),
    },
  }
);
```

## `regex`

_**Params**_

- `regexps: MaybeRefOrGetter<RegExp | RegExp[]>`

Checks if the value matches one or more regular expressions.

```ts
import { regex } from '@regle/rules';

const { r$ } = useRegle(
  { name: '' },
  {
    name: {
      regex: regex(/^foo/),
      regex: regex([/^bar/, /baz$/]),
    },
  }
);
```

## `required`

Requires non-empty data. Checks for empty arrays and strings containing only whitespaces.

```ts
import { required } from '@regle/rules';

const { r$ } = useRegle(
  { name: '' },
  {
    name: { required },
  }
);
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
});
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
    required: requiredUnless(conditionRef),
  },
});
```

## `sameAs`

_**Params**_

- `target: unknown`

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
  },
});
```

## `startsWith`

_**Params**_

- `start: Ref<string> | string | () => string`

Checks if the string starts with the specified substring.

```ts
import { startsWith } from '@regle/rules';

const { r$ } = useRegle(
  { bestLib: '' },
  {
    bestLib: {
      startsWith: startsWith('regle'),
    },
  }
);
```

## `string`

Requires a value to be a native string type. Mainly used for typing

```ts
import { type InferInput } from '@regle/core';
import { string } from '@regle/rules';

const rules = {
  firstName: { string },
};

const state = ref<InferInput<typeof rules>>({});
```

## `type`

Define the input type of a rule. No runtime validation.  
Override any input type set by other rules.

```ts
import { type InferInput } from '@regle/core';
import { type } from '@regle/rules';

const rules = {
  firstName: { type: type<string>() },
};

const state = ref<InferInput<typeof rules>>({});
```

## `uppercase`

Validates uppercase strings.

```ts
import { uppercase } from '@regle/rules';

const { r$ } = useRegle(
  { name: '' },
  {
    name: { uppercase },
  }
);
```

## `url`

_**Params**_

- `options?: {protocol?: RegExp}`

Validates URLs.

```ts
import { url } from '@regle/rules';

const { r$ } = useRegle(
  { bestUrl: '' },
  {
    bestUrl: { url },
    // or with custom protocol validation
    bestUrl: { url: url({ protocol: /^https?$/ }) },
  }
);
```
