---
title: Validations helpers
---

# Validations helpers

When writing custom rules, some checks or validations can become tedious, especially when handling values that might be null, undefined, or unset. It's also a best practice to verify whether a field is "filled" before proceeding with validation.

To simplify this process, Regle provides a set of utility functions to assist in creating custom rules.

These utilities can be accessed via:

```ts
import { isFilled, isEmpty, getSize, ... } from '@regle/rules';
```

## Runtime and Type guards

### `isFilled`

This is almost a must have for optional fields. It checks if any value you provided is defined (including arrays and objects).
You can base your validator result on this.

`isFilled` also acts as a type guard.

```ts twoslash
const check = (value: any) => false;
//---cut---
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';

const rule = createRule({
  validator(value: unknown) {
    if (isFilled(value)) {
      return check(value);
    }
    return true;
  },
  message: 'Error'
})
```

### `isEmpty`

This is the inverse of `isFilled`. It will check if the value is in any way empty (including arrays and objects)

`isEmpty` also acts as a type guard.

```ts twoslash
const check = (value: any) => false;
//---cut---
import { createRule, type Maybe } from '@regle/core';
import { isEmpty } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return check(value);
    //           ^?
  },
  message: 'Error'
})
```


### `isNumber`

This is a type guard that will check if the passed value is a real `Number`.
This also returns false for `NaN`, so this is better than `typeof value === "number"`.

```ts twoslash
const checkNumber = (value: number) => false;
//---cut---
import { createRule, type Maybe } from '@regle/core';
import { isFilled, isNumber } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<number | string>) {
    if (isFilled(value) && isNumber(value)) {
      return checkNumber(value);
//                        ^?
    }
    return true;
  },
  message: 'Error'
})
```


### `isDate`

This is a useful helper that can check if the provided value is a Date, it is used internally for `date` rules.
This can also check strings.

```ts twoslash
const checkDate = (value: Date) => false;
//---cut---
import { createRule, type Maybe } from '@regle/core';
import { isFilled, isDate } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<string | Date>) {
    if (isFilled(value) && isDate(value)) {
      return checkDate(value);
//                        ^?
    }
    return true;
  },
  message: 'Error'
})
```

## Operations utils

### `getSize`

This helper will return the length of any data type you pass.
It works with strings, arrays, objects and numbers.

```ts twoslash
import { createRule, type Maybe } from '@regle/core';
import { isFilled, getSize } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<string | Array<number>>) {
    if (isFilled(value)) {
      return getSize(value) > 6;
    }
    return true;
  },
  message: 'Error'
})
```

### `matchRegex`

This utility can take multiple regular expressions as arguments. It checks the input's validity and tests it against the provided regex patterns.

```ts twoslash
import { createRule, type Maybe } from '@regle/core';
import { isFilled, matchRegex } from '@regle/rules';

const rule = createRule({
  validator(value: Maybe<string>, ...regexps: RegExp[]) {
    if (isFilled(value)) {
      return matchRegex(value, ...regexps);
    }
    return true;
  },
  message: 'Error'
})
```

## Coerce utils

### `toNumber`

This utility converts any string (or number) into a number using the `Number` constructor.

:::warning
This helper returns `NaN` if the input cannot be coerced, which is technically still a number.

It can be safe to also check for `isNaN` additionally.
:::


### `toDate`

This utility will coerce any string, number or Date value into a Date using the `Date` constructor.
