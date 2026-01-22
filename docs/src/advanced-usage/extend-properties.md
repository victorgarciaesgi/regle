---
title: Extend properties
description: Regle offers a way to extend the default validation properties with defineRegleConfig
---


# Extend properties

Regle offers a way to extend the default validation properties with `defineRegleConfig`.

For more information about global config [check here](/advanced-usage/global-config)


## Extending field properties


```ts twoslash
import { required } from '@regle/rules';
// @noErrors
// ---cut---
import { defineRegleConfig } from '@regle/core';

const { useRegle } = defineRegleConfig({
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false;
    }
  }
});

const { r$ } = useRegle({ name: '' }, {
  name: {
    required
  }
})

r$.name.$isRe
//          ^|
```


## Extending nested object properties


```ts twoslash
import { required } from '@regle/rules';
// @noErrors
// ---cut---
import { defineRegleConfig } from '@regle/core';

const { useRegle } = defineRegleConfig({
  shortcuts: {
    nested: {
      $isEmpty: (nest) => Object.keys(nest.$fields).length === 0;
    }
  }
});

const { r$ } = useRegle({ user: {} } as { user: { firstName?: string, lastName?: string } }, {
  user: {
    firstName: {required}
  }
})

r$.user.$is
//         ^|

```


## Extending collections properties


```ts twoslash
import { required } from '@regle/rules';
// @noErrors
// ---cut---
import { defineRegleConfig } from '@regle/core';

const { useRegle } = defineRegleConfig({
  shortcuts: {
    collections: {
      $isArrayEmpty: (collection) => collection.$each.length === 0;
    }
  }
});

const { r$ } = useRegle({ projects: [{ name: '' }] }, {
  projects: {
    $each: {
      name: { required }
    }
  }
})

r$.projects.$is
//             ^|

```


## Typing shortcuts in component props <span data-title='*.ts'></span>

When defining shortcuts, it can be hard to type props in common Input components.
For this Regle provides a type helper that can ease the declaration of these props.


:::code-group

```ts twoslash include config [config.ts]
// @module: esnext
// @filename config.ts
// ---cut---
import { defineRegleConfig } from '@regle/core';
export const { useRegle: useCustomRegle } = defineRegleConfig({
  shortcuts: {
    fields: {
      $test: () => true,
    },
  },
});
```

```vue twoslash [myInput.vue]
<script lang='ts' setup>
import { defineRegleConfig } from '@regle/core';
// @include: config
// @noErrors
// ---cut---
// @module: esnext
import type { RegleCustomFieldStatus } from '@regle/core';
import {useCustomRegle} from './config'

const props = defineProps<{
  field: RegleCustomFieldStatus<typeof useCustomRegle, string, 'required'>;
  placeholder: string;
}>();

props.field.$test
</script>
```


:::
