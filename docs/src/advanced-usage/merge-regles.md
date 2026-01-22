---
title: Merge multiple Regles
---

# Merge multiple Regles

If you need to combine multiple Regle instances into one, it's possible with the `mergeRegles` helper.

it will return an output similar to the main `r$`, while still being able to call `$touch` or `$validate`.

All types are preserved.

```ts twoslash
import {required, numeric, email} from '@regle/rules';
// ---cut---
// @noErrors
import { mergeRegles, useRegle } from '@regle/core';


const { r$ } = useRegle({email: ''}, {
  email: { required, email },
});

const { r$: otherR$ } = useRegle({firstName: ''}, {
  firstName: { required },
});

const r$Merged = mergeRegles({ r$, otherR$ });

r$Merged.$value.otherR$.
//                      ^|


```
