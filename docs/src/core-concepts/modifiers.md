---
title: Modifiers
---

# Modifiers

Modifiers are behaviours or settings letting you control how the rules will behave.

# Deep modifiers

```ts twoslash
// @noErrors
import {useRegle} from '@regle/core';
// ---cut---
const {regle} = useRegle({}, {}, {""})
//                                 ^|
```

### `autoDirty`
Type: `boolean`

Default: `true`

Allow all the nested rules to track changes on the state automatically.
If set to `false`, you need to call `$touch` to manually trigger the change

### `lazy`
Type: `boolean`

Default: `false`

Usage:

When set to false, tells the rules to be called on init, otherwise they are lazy and only called when the field is dirty.