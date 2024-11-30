---
title: Extend properties
---


# Extend properties

Regle offer you a way yo extend the default validation properties via `defineRegleConfig`


## Extending field properties


```ts twoslash
import {required} from '@regle/rules';
// @noErrors
// ---cut---
import {defineRegleConfig} from '@regle/core';

const {useRegle} = defineRegleConfig({
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? true;
    }
  }
});

const {r$} = useRegle({name: ''}, {
  name: {
    required
  }
})

r$.$fields.name.$isRe
//                   ^|
```


## Extending nested object properties


```ts twoslash
import {required} from '@regle/rules';
// @noErrors
// ---cut---
import {defineRegleConfig} from '@regle/core';

const {useRegle} = defineRegleConfig({
  shortcuts: {
    nested: {
      $isEmpty: (nest) => Object.keys(nest.$fields).length === 0;
    }
  }
});

const {r$} = useRegle({user: {}} as {user: {firstName?: string, lastName?: string}}, {
  user: {
    firstName: {required}
  }
})

r$.$fields.user.$is
//                 ^|

```


## Extending collections properties


```ts twoslash
import {required} from '@regle/rules';
// @noErrors
// ---cut---
import {defineRegleConfig} from '@regle/core';

const {useRegle} = defineRegleConfig({
  shortcuts: {
    collections: {
      $isArrayEmpty: (collec) => collec.$each.length === 0;
    }
  }
});

const {r$} = useRegle({projects: [{name: ''}]}, {
  projects: {
    $each: {
      name: {required}
    }
  }
})

r$.$fields.projects.$is
//                     ^|

```


## Typing shortcuts in component props <span data-title='*.ts'></span>

When defining shortcuts, it can be hard to type props in common Input components.
For this Regle provides a type helper that can ease the declaration of this props.

```twoslash include config
import {defineRegleConfig} from '@regle/core';
export const { useRegle: useCustomRegle } = defineRegleConfig({
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
});
</script>
```

:::code-group



```vue twoslash [myInput.vue]
<script setup lang="ts">
// @include: config
// @noErrors
// ---cut---
// @module: esnext
import type { RegleFieldStatus, InferRegleShortcuts } from '@regle/core';
import {useCustomRegle} from './config';

type MyShortcuts = InferRegleShortcuts<typeof useCustomRegle>;

const props = defineProps<{
  field: RegleFieldStatus<string, any, MyShortcuts>;
  placeholder: string;
}>();

props.field.$isR
//              ^|
</script>
```

```ts twoslash [config.ts]
// @module: esnext
// @filename config.ts
// ---cut---
// @include: config
```





:::