---
title: Collections - Declaring rules
---

<script setup>
import DisplayingCollectionErrors from '../parts/components/collections/DisplayingCollectionErrors.vue';
import AccessingCurrentItemState from '../parts/components/collections/AccessingCurrentItemState.vue';
import ValidatingArray from '../parts/components/collections/ValidatingArray.vue';
</script>

# Collections

## Declaring rules for collection

Your forms can often contain collections validations. Where you need to validate multiple items sharing nested shape. It can easily be done with `$each` in the rules declaration.

You can also add validation for the field containing the array.

:::warning
Due to Javascript limitations with [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), it's recommanded to use only arrays of objects.

Primitives (Strings, Numbers etc...) are immutable, so they can't be modified to add a track id (the way Regle works for collections).
:::

```ts twoslash
import {useRegle} from '@regle/core';
import {ref} from 'vue';
import {required} from '@regle/rules';
// ---cut---
const form = ref<{collection: Array<{name: string}>}>({
  collection: []
})

const {r$} = useRegle(form, {
  collection: {
    $each: {
      name: {required},
    }
  }
})
```


## Displaying collections errors

For collections, the best way to display errors is to bind your list to the `$each` linked to your state. In this exemple `r$.$fields.collection.$each`.

But you can also map your errors to the `r$.$errors.collection.$each`.

```vue twoslash
<template>
  <div 
    v-for="item of r$.$fields.collection.$each" 
    :key="item.$id">
    <div>
      <input
        v-model="item.$value.name"
        :class="{ valid: item.$fields.name.$valid }"
        placeholder="Type an item value"
      />
      <ul>
        <li v-for="error of item.$fields.name.$errors" :key="error">
          {{ error }}
        </li>
      </ul>
    </div>
  </div>
  <button type="button" @click="form.collection.push({ name: '' })">Add item</button>
  <button type="button" @click="r$.$resetAll">Reset</button>
</template>

<script setup lang="ts">
//---cut---
import { ref } from 'vue';
import { required } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: {
      name: { required },
    },
  },
});
</script>
```

Result: 

<DisplayingCollectionErrors/>


## Validating the array independently

Sometimes you not only want to validate each field in every element of the array, but validating the array it self, like its size.

You can do this exactly like a normal field.

The errors can be displayed either by `r$.$errors.[field].$self` or `r$.$fields.[field].$field.$errors`


```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, minLength } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref<{ collection: Array<{ name: string }> }>({
  collection: [{ name: '' }],
});

const { r$ } = useRegle(form, {
  collection: {
    minLength: minLength(4),
    $each: {
      name: { required },
    },
  },
});
```

Result:

<ValidatingArray/>


## Accessing the current item state

In each item of your collection, you may have a validation that depends on another property of the item.
You can access the current item state and index by providing a function callback to `$each`.

```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, requiredIf } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref({
  collection: [{ name: '', condition: false }],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: (item, index) => ({
      name: { required: requiredIf(() => item.value.condition) },
    }),
  },
});
```

Result:

<AccessingCurrentItemState/>

## Providing custom key to track item

By default, Regle will generate a random ID to track your items and keep its state through mutations. This ID is stored in `$id` and can be used in Vue as a `key` for rendering.

You can also provide your own key to the rule for custom tracking


```ts twoslash
//---cut---
import { ref } from 'vue';
import { required, requiredIf } from '@regle/rules';
//---cut---
import { useRegle } from '@regle/core';

const form = ref({
  collection: [{ name: '', uuid: '28xja83' }],
});

const { r$ } = useRegle(form, {
  collection: {
    $each: (item) => ({
      $key: item.value.uuid,
      name: { required },
    }),
  },
});
```
